import layersTree from './layersTree';
import interactions from './interactions';
import customStyle from './customStyle';

export default {
  title: 'Mobilité',
  layersTree,
  interactions,
  map: {
    accessToken: 'pk.eyJ1IjoibWFraW5hY29ycHVzIiwiYSI6ImNqdzF6eWhhbDBwYnc0N3BscHNoM3Y2NWQifQ.miNBzyxOCefDL8t-CodGhA',
    backgroundStyle: 'mapbox://styles/makinacorpus/cjpdvdqdj0b7a2slajmjqy3py',
    center: [-1.686401, 48.106514],
    zoom: 7,
    maxZoom: 19.9,
    minZoom: 7,
    customStyle,
    fitBounds: {
      coordinates: [[-6.0002640, 46.8491442], [1.9477370, 49.5994025]],
    },
  },
};
