import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'

const Globe = () => {
  const canvasRef = useRef()
  const globeRef = useRef()

  useEffect(() => {
    let phi = 0

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600,
      height: 600,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        // Add some interesting locations
        { location: [37.7595, -122.4367], size: 0.03 }, // San Francisco
        { location: [40.7128, -74.006], size: 0.03 }, // New York
        { location: [51.5074, -0.1278], size: 0.03 }, // London
        { location: [35.6762, 139.6503], size: 0.03 }, // Tokyo
        { location: [-33.8688, 151.2093], size: 0.03 }, // Sydney
      ],
      onRender: (state) => {
        // Auto-rotate
        phi += 0.01
        state.phi = phi
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