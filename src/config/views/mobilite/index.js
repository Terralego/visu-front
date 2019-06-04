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
    center: [-2.028, 47.852],
    zoom: 7.7,
    maxZoom: 19.9,
    minZoom: 7,
    customStyle,
    fitBounds: {
      coordinates: [[-4.850, 46.776], [-0.551, 48.886]],
    },
  },
};
