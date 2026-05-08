import { mockPins, layerConfig } from '../data/mockData';
import type { LayerType } from '../data/mockData';
import './LayerToggle.css';

interface LayerToggleProps {
  activeLayer: string;
  onLayerChange: (layer: string) => void;
  showDemoData?: boolean;
}

export function LayerToggle({ activeLayer, onLayerChange }: LayerToggleProps) {
  const counts = {
    all: mockPins.filter(p => p.layer === 'free' ? (p as any).status !== 'gone' : true).length,
    free: mockPins.filter(p => p.layer === 'free' && (p as any).status !== 'gone').length,
    events: mockPins.filter(p => p.layer === 'events').length,
    marketplace: mockPins.filter(p => p.layer === 'marketplace').length,
    hangout: mockPins.filter(p => p.layer === 'hangout').length,
  };

  return (
    <div className="layerBar" id="layer-toggle-bar">
      <button
        className={`layerPill ${activeLayer === 'all' ? 'active allActive' : ''}`}
        onClick={() => onLayerChange('all')}
        id="layer-all"
      >
        All
        <span className="pillCount">{counts.all}</span>
      </button>

      {(Object.keys(layerConfig) as LayerType[]).map((key) => {
        const config = layerConfig[key];
        const isActive = activeLayer === key;
        const activeClass = key === 'free' ? 'freeActive' : key === 'events' ? 'eventsActive' : key === 'hangout' ? 'hangoutActive' : 'marketActive';

        return (
          <button
            key={key}
            className={`layerPill ${isActive ? `active ${activeClass}` : ''}`}
            onClick={() => onLayerChange(key)}
            id={`layer-${key}`}
          >
            <span className="pillDot" style={{ background: config.color }} />
            {config.label}
            <span className="pillCount">{counts[key]}</span>
          </button>
        );
      })}
    </div>
  );
}
