export const isGroupHidden = (layers, getLayerState) => layers.reduce((prev, layer) =>
  (prev && (
    layer.layers
      ? (getLayerState({ layer }).hidden ||
        isGroupHidden(layer.layers, getLayerState))
      : getLayerState({ layer }).hidden
  )),
true);

const isVisibleLeaf = (layer, getLayerState) => !getLayerState({ layer }).hidden;

const isGroup = layer => !!layer.group;

export const isNodeActive = (layer, getLayerState) =>
  (isGroup(layer)
    ? layer.layers.some(sublayer => isNodeActive(sublayer, getLayerState))
    : isVisibleLeaf(layer, getLayerState) && !!getLayerState({ layer }).active);

export const getGroupCounters = (layers = [], getLayerState) =>
  layers.reduce(({ total, active }, layer) => {
    if (isGroup(layer) && !layer.exclusive) {
      const subCounters = getGroupCounters(layer.layers, getLayerState);
      return {
        total: total + subCounters.total,
        active: active + subCounters.active,
      };
    }

    const isVisible = isGroup(layer)
      ? !isGroupHidden(layer.layers, getLayerState)
      : isVisibleLeaf(layer, getLayerState);

    if (!isVisible) return { total, active };

    return {
      total: total + 1,
      active: active + (isNodeActive(layer, getLayerState) ? 1 : 0),
    };
  }, { total: 0, active: 0 });

export const getNodesKeys = (nodes = []) => {
  const occurrences = new Map();

  return nodes.map(({ group, label }, index) => {
    const name = group || label || `${index}`;
    const occurrence = occurrences.get(name) || 0;
    occurrences.set(name, occurrence + 1);
    return occurrence ? `${name}-${occurrence}` : name;
  });
};

export default { isGroupHidden, getGroupCounters, isNodeActive, getNodesKeys };
