# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy"]
# ///
"""Ajusta la entrada del portátil: proyecta sus esquinas con la misma cámara que mundo3d.ts y la
cámara 2D, e imprime la caja en pantalla de cada fotograma (tiene que caber en 1080x1920).

  uv run encuadre_portatil.py <centro_inicial x,y,z> <rx,ry,escala iniciales>
  uv run encuadre_portatil.py 540,1300,-1300 -46,-30,0.75      (una entrada de ejemplo)

Copia los fotogramas clave de la cámara (CAM) y los de entrada (LAP_IN, BRAND_OUT) de tu vídeo
antes de usarlo. El muelle está aproximado, así que confirma con fotogramas sueltos.
"""
import math, numpy as np
W,H,D=1080,1920,2400
FOV=2*math.atan(H/2/D)
def Rx(a): c,s=math.cos(a),math.sin(a); return np.array([[1,0,0],[0,c,-s],[0,s,c]])
def Ry(b): c,s=math.cos(b),math.sin(b); return np.array([[c,0,s],[0,1,0],[-s,0,c]])
rad=math.radians
def proj(v):  # three world -> composition px
    x,y,z=v; cx,cy=W/2,-H/2
    dz=D-z; f=D/dz
    return (W/2+(x-cx)*f, H/2-(y-cy)*f)
def io(t): t=min(1,max(0,t)); return 4*t**3 if t<.5 else 1-(-2*t+2)**3/2
def p(f,a,d,e=lambda t:t): return e(min(1,max(0,(f-a)/d)))
def mix(a,b,t): return a+(b-a)*t
def spring(f,at,dur,k=90,damp=1):
    # rough critically-damped spring
    t=max(0,(f-at))/dur*5
    return 1-(1+t)*math.exp(-t) if f>at else 0
MARCA_AT=114; BRAND_OUT=160; LAP_IN=162
CAM=[(BRAND_OUT+2,540,920,1.04),(LAP_IN+26,540,1110,0.92),(212+2-4,540,1080,1.12)]
def cam(f):
    for a,b in zip(CAM,CAM[1:]):
        if f<b[0]:
            t=io((f-a[0])/(b[0]-a[0])); return [mix(a[i],b[i],t) for i in (1,2,3)]
    return CAM[-1][1:]
OFF=np.array([0,0,340.0])
def R(rx,ry): return Rx(rad(-rx))@Ry(rad(ry))
def puntos(abre):
    pts=[]
    for x in (-500,500):
        for y in (-27,3):
            for z in (-20,660): pts.append(np.array([x,y,z],float))
    T=Rx(rad(90-abre))
    for x in (-480,480):
        for y in (0,620):
            for z in (-17,17): pts.append(T@np.array([x,y,z-8],float))
    return pts
import sys
C0=np.array([float(a) for a in sys.argv[1].split(',')])  # css x,y,z of base centre at start
rx0,ry0,s0=[float(a) for a in sys.argv[2].split(',')]
H1=np.array([540,1420,0.0]); rx1,ry1=6,-10
def css2three(v): return np.array([v[0],-v[1],v[2]])
C1=H1+np.array([1,-1,1])*(R(rx1,ry1)@OFF)
for f in range(160,200,3):
    e=spring(f,LAP_IN,20); ce=min(1,e)
    rx=mix(rx0,rx1,e); ry=mix(ry0,ry1,e); s=mix(s0,1,ce)
    C=mix(C0,C1,ce)
    hinge=C-np.array([1,-1,1])*(s*(R(rx,ry)@OFF))
    abre=mix(3,98,p(f,LAP_IN+8,24,io))
    M=R(rx,ry)*s; o=css2three(hinge)
    xs,ys=[],[]
    cx,cy,cz=cam(f)
    for q in puntos(abre):
        w=M@q+o; sx,sy=proj(w)
        xs.append((sx-cx)*cz+540); ys.append((sy-cy)*cz+1060)
    print(f, f'e={e:.2f} abre={abre:5.1f}', f'x {min(xs):6.0f}..{max(xs):6.0f}  y {min(ys):6.0f}..{max(ys):6.0f}', 'hinge', hinge.round())
