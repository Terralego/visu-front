import layersTree from './layersTree';
import interactions from './interactions';
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
    center: [-1.686401, 48.106514],
    zoom: 7,
    maxZoom: 19.9,
    minZoom: 7,
    customStyle,
    fitBounds: [[-6.0002640, 46.8491442], [1.9477370, 49.5994025]],
  },
};
