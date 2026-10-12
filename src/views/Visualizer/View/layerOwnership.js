export const flattenLayersTree = (nodes = []) =>
  nodes.reduce(
    (acc, node) => (node.group ? [...acc, ...flattenLayersTree(node.layers)] : [...acc, node]),
    [],
  );

export const layerOwnsMapboxId = ({ layers = [], sublayers = [] } = {}, mapboxLayerId) =>
  !!mapboxLayerId &&
  (layers.includes(mapboxLayerId) ||
    sublayers.some(({ layers: sublayerIds = [] }) => sublayerIds.includes(mapboxLayerId)));

export default { flattenLayersTree, layerOwnsMapboxId };
