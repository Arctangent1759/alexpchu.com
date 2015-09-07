import random
import pyaudio
import matplotlib.pyplot as plt
import numpy as np
import bitarray
from threading import Thread, Lock
from time import sleep
import ax25
import sys
import Queue
from scipy import signal

CENTER_FREQ = 145.530e6
PLAY_RECEIVED = True


# function to generate a checksum for validating packets
def genfcs(bits):
    # Generates a checksum from packet bits
    fcs = ax25.FCS()
    for bit in bits:
        fcs.update_bit(bit)
    
    digest = bitarray.bitarray(endian="little")
    digest.frombytes(fcs.digest())

    return digest



# function to parse packet bits to information
def decodeAX25(bits):
    ax = ax25.AX25()
    ax.info = "bad packet"
    
    
    bitsu = ax25.bit_unstuff(bits[8:-8])
    
    if (genfcs(bitsu[:-16]).tobytes() == bitsu[-16:].tobytes()) == False:
        #print("failed fcs")
        return ax
    
    bytes = bitsu.tobytes()
    ax.destination = ax.callsign_decode(bitsu[:56])
    source = ax.callsign_decode(bitsu[56:112])
    if source[-1].isdigit() and source[-1]!="0":
        ax.source = b"".join((source[:-1],'-',source[-1]))
    else:
        ax.source = source[:-1]
    
    digilen=0    
    
    if bytes[14]=='\x03' and bytes[15]=='\xf0':
        digilen = 0
    else:
        for n in range(14,len(bytes)-1):
            if ord(bytes[n]) & 1:
                digilen = (n-14)+1
                break

    ax.digipeaters =  ax.callsign_decode(bitsu[112:112+digilen*8])
    ax.info = bitsu[112+digilen*8+16:-16].tobytes()
    
    return ax


def detectFrames(NRZI):  
    # function looks for packets in an NRZI sequence and validates their checksum
    
    # compute finite differences of the digital NRZI to detect zero-crossings
    dNRZI = NRZI[1:] - NRZI[:-1]
    # find the position of the non-zero components. These are the indexes of the zero-crossings. 
    transit = np.nonzero(dNRZI)[0]
    # Transition time is the difference between zero-crossings
    transTime = transit[1:]-transit[:-1]
    
    # loop over transitions, convert to bit streams and extract packets
    dict = { 1:bitarray.bitarray([0]), 2:bitarray.bitarray([1,0]), 3:bitarray.bitarray([1,1,0]),
            4:bitarray.bitarray([1,1,1,0]),5:bitarray.bitarray([1,1,1,1,0]),6:bitarray.bitarray([1,1,1,1,1,0])
            ,7:bitarray.bitarray([1,1,1,1,1,1,0])}
    
    state = 0; # no flag detected yet
    
    packets =[]
    tmppkt = bitarray.bitarray([0])
    lastFlag = 0  # position of the last flag found. 
    
    for n in range(0,len(transTime)):
        Nb = round(transTime[n]/40.0)  # maps intervals to bits. Assume 48000 and 1200baud
        if (Nb == 7 and state ==0):
            # detected flag frame, start collecting a packet
            tmppkt = tmppkt +  dict[7]
            state = 1  # packet detected
            lastFlag = transit[n-1]
            continue
        if (Nb == 7 and state == 1):
            # detected end frame successfully
            tmppkt = tmppkt + dict[7]
            
            # validate checksum
            bitsu = ax25.bit_unstuff(tmppkt[8:-8]) # unstuff bits
            if (genfcs(bitsu[:-16]).tobytes() == bitsu[-16:].tobytes()) :
                # valid packet
                print "packet"
                packets.append(tmppkt)
            else:
                print "Bad checksum"
            tmppkt  = bitarray.bitarray([0])
            state = 0
            continue
        
        if (state == 1 and Nb < 7 and Nb > 0):
            # valid bits 
            tmppkt = tmppkt + dict[Nb]
            continue
        else:
            # not valid bits reset
            state = 0
            tmppkt  = bitarray.bitarray([0])
            continue
   
    if state == 0:
        lastFlag = -1
    
    # if the state is 1, which means that we detected a packet, but the buffer ended, then
    # we return the position of the beginning of the flag within the buffer to let the caller
    # know that there's a packet that overlapps between two buffer frames. 
    
    return packets, lastFlag

receiveStop = False
def processBuf(q, bufSize, frameSize=4800):
    buf = np.array([])
    while not receiveStop:
        c = q.get()
        if c == "END":
            break
        buf = np.append(buf,c)
        #plt.plot(np.r_[-24000:24000:48000.0/len(buf)],np.fft.fftshift(np.fft.fft(buf)))
        #plt.show()
        if len(buf) >= bufSize*frameSize:
            packets, lastFlag = detectFrames(np.sign(nc_afskDemod(buf)))
            for packet in packets:
                ax = decodeAX25(packet)
                print "Destination: "+str(ax.destination)
                print "Source: "+str(ax.source)
                print "Digipeaters: "+str(ax.digipeaters)
                print "Info: "+str(ax.info)
                print
                print "========================="
                print
            if len(packets)==0:
                buf = buf[frameSize:]
            else:
                buf = buf[lastFlag:]



def afsk1200(bits, fc = 1700.0, fd=500.0, fs=48000):
    Ns = int(fs/(fc-fd))
    float_bits = np.array(reduce(lambda x,y:x+y,[[1.0 if i else -1.0]*Ns for i in bits]))
    phi = 2*np.pi*np.cumsum(fc + float_bits*fd)/fs
    return np.cos(phi)

def nc_afskDemod(sig, TBW=2.0, N=74, fs=48000):
    bw = float(TBW*fs)/N
    t = np.r_[:N]/float(fs)
    h = signal.firwin(N,bw/2.0,nyq=float(fs)/2)
    b0=h*np.exp(2*np.pi*1.0j*1200.0*t)
    b1=h*np.exp(2*np.pi*1.0j*2200.0*t)
    return np.abs(signal.fftconvolve(sig,b1)) - np.abs(signal.fftconvolve(sig,b0))

def getRadioIndex(p):
    for n in range(0,p.get_device_count()):
        if 'USB PnP Sound Device' in p.get_device_info_by_index(n).get('name'):
            return n
    return None

def NRZ2NRZI(NRZ):
    NRZI = NRZ.copy() 
    current = True
    for n in range(0,len(NRZ)):
        if NRZ[n] :
            NRZI[n] = current
        else:
            NRZI[n] = not(current)
        current = NRZI[n]
    return NRZI

def genPTT(plen,zlen,fs):
    Nz = np.floor(zlen*fs)
    Nt = np.floor(plen*fs)
    pttsig = np.zeros(Nz)
    t=np.r_[0.0:Nt]/fs
    pttsig[:Nt] = 0.5*np.sin(2*np.pi*t*2000)
    return pttsig

class Audio():
    def __init__(self,fs=48000,frames_per_buffer=4800):
        self.frames_per_buffer=frames_per_buffer
        self.fs=fs
        self.p = pyaudio.PyAudio()

        self.StopThread = False

        self.recordQueue = Queue.Queue()

        self.recordBuf = []
        istream = self.p.open(format=pyaudio.paFloat32, channels=1, rate=int(self.fs),input=True,frames_per_buffer=self.frames_per_buffer,input_device_index=getRadioIndex(self.p))
        #istream = self.p.open(format=pyaudio.paFloat32, channels=1, rate=int(self.fs),input=True,frames_per_buffer=self.frames_per_buffer)
        def recordThread():
            while not self.StopThread:
                try:
                    samples = np.fromstring(istream.read(self.frames_per_buffer),'float32')
                    self.recordBuf.append(samples)
                    self.recordQueue.put(samples)
                    if PLAY_RECEIVED:
                        self.play(samples)
                except:
                    print "Record Exception ignored!"
            self.recordQueue.put("END")
        Thread(target = recordThread).start()


        self.playBuf = np.array([])
        self.playLock = Lock()
        ostream = self.p.open(format=pyaudio.paFloat32, channels=1, rate=int(fs),output=True)
        def playThread():
            while not self.StopThread:
                with self.playLock:
                    ostream.write(self.playBuf.astype(np.float32).tostring())
                    self.playBuf=np.array([])
        Thread(target = playThread).start()

        self.transmitBuf = np.array([])
        self.transmitLock = Lock()
        rstream = self.p.open(format=pyaudio.paFloat32, channels=1, rate=int(fs),output=True,output_device_index=getRadioIndex(self.p))
        def transmitThread():
            while not self.StopThread:
                with self.transmitLock:
                    rstream.write(self.transmitBuf.astype(np.float32).tostring())
                    self.transmitBuf=np.array([])
        Thread(target = transmitThread).start()

    def play(self,s):
        with self.playLock:
            self.playBuf = np.append(self.playBuf,s)

    def transmit(self,s):
        with self.transmitLock:
            self.transmitBuf = np.append(self.transmitBuf,s)

    def record(self,t,whileRec=lambda :None):
        self.recordBuf=[]
        whileRec()
        numFrames = int(self.fs / self.frames_per_buffer * t)
        while len(self.recordBuf) < numFrames:
            if self.StopThread:break;
        if len(self.recordBuf[:numFrames])==0:
            return False
        return np.concatenate(self.recordBuf[:numFrames])

    def release(self):
        self.StopThread = True

PROMPT = "MSG: "

from  scipy.io.wavfile import read as wavread
def main():

    #data = a.record(20)
    #a.play(data)

    #a = Audio()
    #processBuf(a.recordQueue,10)


    """
    sig = wavread("ISSpkt_full.wav")[1]
    Qin = Queue.Queue()
    for n in np.r_[0:len(sig):4800]:
        Qin.put(sig[n:n+4800])
    Qin.put("END")
    processBuf(Qin,10)


    """
    ptt = genPTT(.10,.30,48000)
    callsign = raw_input("Please enter your callsign: ").upper()
    a = Audio()
    try:
        Thread(target = processBuf,args=(a.recordQueue,10)).start()
        while True:
            cmd = raw_input(PROMPT)
            if cmd == "\\exit":
                break
            packet = ax25.UI(destination="APDSP",source=callsign, info=cmd,digipeaters=['WIDE1-1','WIDE2-1'])
            msg = afsk1200(NRZ2NRZI(bitarray.bitarray(np.zeros(160).tolist())+packet.unparse()))
            a.transmit(ptt)
            a.transmit(msg)
    except EOFError:
        pass
    finally:
        print "Goodbye!"
        a.release()
        receiveStop = True


if __name__ == '__main__':
    main()
