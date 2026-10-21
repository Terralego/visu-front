const NAME = /^[A-Za-z_]\w*$/;
const IGNORED = new Set(['id', 'loading', 'error']);

const isNumeric = value => value !== '' && value !== null && typeof value !== 'boolean' && Number.isFinite(Number(value));

const pickFields = properties => {
  const keys = Object.keys(properties).filter(key => NAME.test(key) && !key.startsWith('_') && !IGNORED.has(key));
  const text = keys.find(key => typeof properties[key] === 'string' && properties[key] && !isNumeric(properties[key]));
  const numbers = keys.filter(key => isNumeric(properties[key])).slice(0, 4);
  return { text: text ?? keys[0] ?? 'nom', numbers: numbers.length ? numbers : ['absent'] };
};

const conditionBlock = field => {
  const then = [{ id: 'cond-then', type: 'alert', severity: 'success', text: `${field} > 0` }];
  const otherwise = [{ id: 'cond-else', type: 'alert', severity: 'warning', text: `${field} ≤ 0 ou absent` }];
  return {
    id: 'condition',
    type: 'condition',
    when: { field, operator: 'gt', value: '0' },
    ...JSON.parse(`{"then":${JSON.stringify(then)},"else":${JSON.stringify(otherwise)}}`),
  };
};

export const buildMinisheetFixture = (properties = {}) => {
  const { text, numbers } = pickFields(properties);
  const [first] = numbers;
  const series = numbers.map(field => ({ field, label: field }));

  return {
    title: { field: text, default: 'Objet sans nom' },
    blocks: [
      {
        id: 'legacy-section',
        type: 'legacy-section',
        name: 'Section Legacy',
        template: `<div class="details__group"><h3 class="details__subtitle">Section Legacy</h3><div class="details__list"><div class="details__column"><span class="details__column-label">${text}</span><span class="details__column-value">{{ ${text} }}</span></div></div></div>`,
      },
      {
        id: 'legacy-field',
        type: 'legacy-field',
        template: `<div class="details__column"><span class="details__column-label">${first}</span><span class="details__column-value">{{ ${first} | default("-") }}</span></div>`,
      },
      { id: 'typo', type: 'typography', variant: 'h6', text: 'Typographie : {{' + text + '}}', icon: { value: '🏔', position: 'start' }, color: 'primary', align: 'center' },
      { id: 'field-simple', type: 'field', field: text, label: 'Simple', style: 'simple' },
      { id: 'field-spread', type: 'field', field: first, label: 'Espacé', style: 'spread', format: { decimals: 2 }, suffix: ' u' },
      { id: 'field-stacked', type: 'field', field: first, label: 'Empilé', style: 'stacked', prefix: '≈ ' },
      { id: 'field-default', type: 'field', field: 'champ_absent', label: 'Absent', style: 'simple', default: 'valeur par défaut' },
      {
        id: 'card',
        type: 'card',
        border: true,
        background: true,
        accent: true,
        color: 'secondary',
        children: [
          { id: 'card-field', type: 'field', field: first, label: 'Mis en avant', style: 'highlight', color: 'inherit', format: { decimals: 1 } },
          { id: 'card-divider', type: 'divider', color: 'inherit' },
          { id: 'card-typo', type: 'typography', variant: 'body2', text: 'Texte hérité de la carte', color: 'inherit' },
        ],
      },
      {
        id: 'repeat',
        type: 'repeat',
        direction: 'horizontal',
        columns: 2,
        stretch: true,
        fields: numbers.map(field => ({ field, label: field, format: { decimals: 0 } })),
        children: [
          {
            id: 'repeat-card',
            type: 'card',
            border: true,
            color: 'primary',
            children: [{ id: 'repeat-field', type: 'field', style: 'highlight', color: 'inherit' }],
          },
        ],
      },
      { id: 'chart-bars', type: 'chart', label: 'Barres', graph: { type: 'bars', orientation: 'vertical', percent: false, unit: '' }, series },
      { id: 'chart-pie', type: 'chart', label: 'Camembert', graph: { type: 'pie' }, series },
      {
        id: 'chart-stacked',
        type: 'chart',
        label: 'Barres empilées (valeurs fixes)',
        graph: { type: 'stacked-bars', orientation: 'horizontal', unit: 'ha', decimals: 1 },
        series: [{ label: 'A', value: 12.34 }, { label: 'B', value: 5 }, { label: 'C', value: 8.5 }],
      },
      { id: 'chart-empty', type: 'chart', label: 'Sans donnée', graph: { type: 'bars' }, series: [{ field: 'champ_absent' }] },
      {
        id: 'accordion',
        type: 'accordion',
        text: 'Accordéon',
        children: [
          { id: 'acc-alert', type: 'alert', severity: 'info', title: 'Dans l\'accordéon', text: 'Valeur : {{' + first + '}}' },
        ],
      },
      conditionBlock(first),
      { id: 'alert-error', type: 'alert', severity: 'error', text: 'Alerte erreur\nsur deux lignes' },
      { id: 'button', type: 'button', label: 'Chercher sur OpenStreetMap', href: 'https://www.openstreetmap.org/search?query={{' + text + '}}', variant: 'contained', color: 'primary', icon: { value: '🔎', position: 'start' } },
      { id: 'image', type: 'image', src: '/favicon.png', alt: 'Logo', caption: 'Image de {{' + text + '}}', width: 30, align: 'center', rounded: true },
      { id: 'iframe', type: 'iframe', src: 'https://www.openstreetmap.org/export/embed.html?bbox=5.7,45.0,6.0,45.2&layer=mapnik', height: 200, border: true },
      { id: 'divider', type: 'divider' },
      { id: 'expert', type: 'expert', template: `<p><em>Bloc expert</em> : {{ ${text} | upper }}</p>` },
      { id: 'unknown', type: 'booleans' },
    ],
  };
};

export default buildMinisheetFixture;
