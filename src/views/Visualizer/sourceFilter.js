import parser from 'pivotql/packages/pivotql-parser-expression/src';
import compilerMb from 'pivotql-compiler-mapboxgl';
import compilerEs from 'pivotql-compiler-elasticsearch';

const addSourceFilter = (layerTreeNode, customStyle) => {
  if (layerTreeNode.group) {
    layerTreeNode.layers.forEach(node => addSourceFilter(node, customStyle));
  } else if (layerTreeNode.source_filter) {
    const layerId = layerTreeNode.layers[0];
    const parsed = parser(layerTreeNode.source_filter || '');

    /* eslint-disable no-param-reassign */
    // Add elasticsearch and mapbox parsed base queries
    layerTreeNode.baseEsQuery = compilerEs(parsed);
    layerTreeNode.baseMbQuery = compilerMb(parsed);
    customStyle.layers = customStyle.layers.map(layer => {
      if (layer.id === layerId) {
        return { ...layer, ...layerTreeNode.baseMbQuery };
      }
      return layer;
    });
    /* eslint-enable no-param-reassign */
  }
};

export default addSourceFilter;
