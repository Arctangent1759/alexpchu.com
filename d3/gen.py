import numpy as np
import csv
t=np.r_[0.:1.:.01]
f = open("data.csv",'w')
w = csv.writer(f)
w.writerow(['input','output'])
for x,y in np.array([t,np.sin(t)]).T:
  w.writerow([x,y])
f.close()
