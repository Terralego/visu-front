import layersTree from './layersTree';
import interactions from '../common/interactions';
import customStyle from './customStyle';

export default {
  title: 'Analyser',
  layersTree,
  interactions,
  map: {
    accessToken: 'pk.eyJ1IjoibWFraW5hY29ycHVzIiwiYSI6ImNqY3E4ZTNwcTFta3ozMm80d2xzY29wM2MifQ.Nwl_FHrWAIQ46s_lY0KNiQ',
    backgroundStyle: [
      { label: 'Clair', url: 'mapbox://styles/makinacorpus/cjpdvdqdj0b7a2slajmjqy3py' },
      { label: 'Photographies aériennes IGN', url: '/background-ign-satellite.json' },
      { label: 'Plan IGN', url: '/background-ign-plan.json' },
    ],
    center: [5.386195159396806, 43.30072210972415],
    zoom: 9,
    maxZoom: 19.9,
    minZoom: 7,
    customStyle,
    fitBounds: [[4.2301364, 42.9822468], [7.7184776, 45.1266002]],
  },
};
