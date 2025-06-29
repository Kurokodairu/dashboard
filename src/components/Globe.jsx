import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'

const Globe = () => {
  const canvasRef = useRef()
  const globeRef = useRef()

  useEffect(() => {
    let phi = 0

    const markers = [
      { location: [59.9139, 10.7522], size: 0.05 }, // Oslo, Norway
    ]
    
    try {
      const cityCoords = JSON.parse(localStorage.getItem('dashboard-city'))
      console.log('User location added to globe markers:', cityCoords)
      if (cityCoords && cityCoords.latitude && cityCoords.longitude) {
        markers.push({
          location: [cityCoords.latitude, cityCoords.longitude],
          size: 0.05, // Make user marker larger
          color: [1, 0, 0], // Custom color for user location
        })
        
      }
    } catch (error) {
      console.error('Error parsing cityCoords from localStorage:', error)
    }

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600,
      height: 600,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1, 
      mapSamples: 16000,
      mapBrightness: 10,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [0.2, 0.2, 0.2],
      markers: markers,
      onRender: (state) => {
      // Auto-rotate
      
        const osloLon = -90 * Math.PI/180;

        const minSpeed = 0.3;   // slowest
        const maxSpeed = 3;   // fastest
        const baseTilt = 0.3; // average tilt
        const tiltAmp  = 0.4; // wobble amplitude

        //Normalize phi into [0, 2π)
        phi = (phi % (2*Math.PI) + 2*Math.PI) % (2*Math.PI);
        //Signed difference from Oslo in [–π, +π)
        let diff = osloLon - phi;
        diff = ((diff + Math.PI) % (2*Math.PI)) - Math.PI;

        //Easing so speed is min at Oslo (diff=0) and max at antipode (diff=π)
        const ease  = (1 - Math.cos(diff)) * 0.5;
        const speed = minSpeed + (maxSpeed - minSpeed) * ease;

        phi += speed * 0.01;
        state.phi = phi;
        state.theta = baseTilt + tiltAmp * Math.sin(diff);

      }
    })

    globeRef.current = globe

    return () => {
      globe.destroy()
    }
  }, [])

  return (
    <div className="globe-wrapper">
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          aspectRatio: '1',
        }}
      />
      
      <style>{`
        .globe-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }

        .globe-wrapper:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}

export default Globe