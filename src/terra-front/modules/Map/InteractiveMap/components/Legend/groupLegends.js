const groupLegendsByLayer = legends => {
  const groups = [];

  legends.forEach(legend => {
    const existing = legend.group !== undefined
      && groups.find(({ group }) => group === legend.group);

    if (existing) {
      existing.legends.push(legend);
      return;
    }

    groups.push({
      key: legend.group !== undefined ? `group-${legend.group}` : legend.renderUuid,
      group: legend.group,
      legends: [legend],
    });
  });

  return groups;
};

export default groupLegendsByLayer;
