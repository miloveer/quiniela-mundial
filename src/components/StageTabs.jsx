function StageTabs({ stages, activeStageId, onChangeStage }) {
  return (
    <section className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-2">
        {stages.map((stage) => {
          const isActive = stage.id === activeStageId;

          return (
            <button
              key={stage.id}
              onClick={() => onChangeStage(stage.id)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-black transition ${
                isActive
                  ? 'bg-slate-950 text-white shadow-lg shadow-slate-300'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {stage.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default StageTabs;