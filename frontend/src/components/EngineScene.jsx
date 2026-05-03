function EngineScene() {
  return (
    <div className="engine-scene" aria-hidden="true">
      <div className="engine-ring ring-a" />
      <div className="engine-ring ring-b" />
      <div className="engine-ring ring-c" />
      <div className="engine-core">
        <div className="engine-core-top" />
        <div className="engine-core-mid" />
        <div className="engine-core-bottom" />
      </div>
      <div className="engine-trail trail-left" />
      <div className="engine-trail trail-right" />
    </div>
  )
}

export default EngineScene
