import Api from '@terralego/core/modules/Api';
import elasticsearch from 'elasticsearch';

export const getEsIndexFromBlocks = blocks => {
  if (!blocks || !Array.isArray(blocks)) return null;
  
  const blockWithFields = blocks.find(block => block.fields?.length > 0);
  if (!blockWithFields) return null;
  
  return blockWithFields.fields[0].field_source || null;
};

export const hideSplashScreen = () => {
  document.body.classList.remove('with-splash');
  const splashScreen = document.querySelector('.splash-screen_container');
  if (splashScreen) {
    splashScreen.remove();
  }
};

export const createEsClient = () =>
  new elasticsearch.Client({
    host: Api.host.replace(/api$/, 'elasticsearch'),
  });

export const filterEmptyFields = block => {
  if (block.type === 'FIELDS_TABLE') {
    if (!block.tableData || block.tableData.length === 0) return null;
    return block;
  }

  if (!block.fields) return block;

  const filteredFields = block.fields.filter(field => {
    const { value } = field;
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });

  if (filteredFields.length === 0) return null;
  return { ...block, fields: filteredFields };
};

export const COMPARE_COLORS = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
];
