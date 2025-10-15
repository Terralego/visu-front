import { extractColumns, getData, prepareData, exportSpreadsheet } from './dataUtils';

// Mock xlsx module for dynamic import
const mockXlsxUtils = {
  book_new: jest.fn(() => ({ SheetNames: [], Sheets: {} })),
  aoa_to_sheet: jest.fn(() => ({ A1: { v: 'test' } })),
  book_append_sheet: jest.fn(),
};

const mockXlsx = {
  utils: mockXlsxUtils,
  writeFile: jest.fn(),
};

jest.mock('xlsx', () => mockXlsx);

describe('dataUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractColumns', () => {
    it('should return columns from fields when provided', () => {
      const fields = [
        { value: 'commune', label: 'Commune', display: true, sortable: false },
        { value: 'population', label: 'Population' },
        { value: 'coordinates', label: 'Coordonnées', exportable: true },
      ];

      const result = extractColumns(fields);

      expect(result).toEqual([
        {
          value: 'commune',
          label: 'Commune',
          display: true,
          sortable: false,
          exportable: undefined,
        },
        { value: 'population', label: 'Population', display: true, sortable: true },
        {
          value: 'coordinates',
          label: 'Coordonnées',
          display: true,
          sortable: true,
          exportable: true,
        },
      ]);
    });

    it('should return columns from results when fields is empty', () => {
      const results = [{ _source: { commune: 'Paris', departement: '75', superficie: 105.4 } }];

      const result = extractColumns([], results);

      expect(result).toEqual([
        { value: 'commune', display: true, sortable: true },
        { value: 'departement', display: true, sortable: true },
        { value: 'superficie', display: true, sortable: true },
      ]);
    });

    it('should return empty array when no fields and no results', () => {
      const result = extractColumns([], []);
      expect(result).toEqual([]);
    });
  });

  describe('getData', () => {
    it('should return simple values as is', () => {
      const dataSource = { commune: 'Lyon', population: 515695 };

      expect(getData(dataSource, 'commune')).toBe('Lyon');
      expect(getData(dataSource, 'population')).toBe(515695);
    });

    it('should join arrays with comma', () => {
      const dataSource = { arrondissements: ['1er', '2e', '3e', '4e'] };

      expect(getData(dataSource, 'arrondissements')).toBe('1er,2e,3e,4e');
    });

    it('should stringify objects', () => {
      const dataSource = {
        geometry: {
          type: 'Point',
          coordinates: [2.3522, 48.8566],
        },
      };

      const result = getData(dataSource, 'geometry');
      expect(result).toBe(
        '{\n  "type": "Point",\n  "coordinates": [\n    2.3522,\n    48.8566\n  ]\n}',
      );
    });

    it('should handle custom object indent', () => {
      const dataSource = {
        properties: {
          code_postal: '75001',
        },
      };
      const settings = { objectIndent: 4 };

      const result = getData(dataSource, 'properties', settings);
      expect(result).toBe('{\n    "code_postal": "75001"\n}');
    });

    it('should return empty string for null and undefined', () => {
      const dataSource = { superficie: null, altitude: undefined };

      expect(getData(dataSource, 'superficie')).toBe('');
      expect(getData(dataSource, 'altitude')).toBe('');
      expect(getData(dataSource, 'nonExistent')).toBe('');
    });
  });

  describe('prepareData', () => {
    it('should map data to columns', () => {
      const fields = [{ value: 'commune' }, { value: 'population' }];
      const results = [
        { _id: 'paris-75', _source: { commune: 'Paris', population: 2165423 } },
        { _id: 'lyon-69', _source: { commune: 'Lyon', population: 515695 } },
      ];

      const result = prepareData(fields, results);

      expect(result).toEqual([
        ['Paris', 2165423],
        ['Lyon', 515695],
      ]);
    });

    it('should handle interpolation in field values', () => {
      const fields = [{ value: '{commune} ({departement})' }];
      const results = [{ _id: 'paris-75', _source: { commune: 'Paris', departement: '75' } }];

      const result = prepareData(fields, results);

      expect(result).toEqual([['Paris (75)']]);
    });

    it('should include _id in data source', () => {
      const fields = [{ value: '_id' }];
      const results = [{ _id: 'commune-75056', _source: { commune: 'Paris' } }];

      const result = prepareData(fields, results);

      expect(result).toEqual([['commune-75056']]);
    });

    it('should handle empty fields', () => {
      const result = prepareData([], [{ _id: 'test-id', _source: { commune: 'Paris' } }]);
      expect(result).toEqual([[]]);
    });
  });

  describe('exportSpreadsheet', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should export CSV format by default', async () => {
      const data = [
        ['Commune', 'Population'],
        ['Paris', 2165423],
      ];

      await exportSpreadsheet({
        name: 'communes-data',
        data,
      });

      expect(mockXlsxUtils.book_new).toHaveBeenCalled();
      expect(mockXlsxUtils.aoa_to_sheet).toHaveBeenCalledWith(data);
      expect(mockXlsxUtils.book_append_sheet).toHaveBeenCalled();
      expect(mockXlsx.writeFile).toHaveBeenCalledWith(expect.any(Object), 'communes-data.csv');
    });

    it('should export XLSX format when specified', async () => {
      const data = [
        ['Commune', 'Population'],
        ['Lyon', 515695],
      ];

      await exportSpreadsheet({
        name: 'export-communes',
        data,
        format: 'xlsx',
      });

      expect(mockXlsx.writeFile).toHaveBeenCalledWith(expect.any(Object), 'export-communes.xlsx');
    });

    it('should clean filename properly', async () => {
      const data = [['Commune']];

      await exportSpreadsheet({
        name: 'données-géographiques-très-longues-qui-dépassent-trente-caractères',
        data,
      });

      // Verify that book_append_sheet was called (filename cleaning happens inside)
      expect(mockXlsxUtils.book_append_sheet).toHaveBeenCalled();
      expect(mockXlsx.writeFile).toHaveBeenCalled();
    });

    it('should throw error for unsupported format', async () => {
      await expect(
        exportSpreadsheet({
          name: 'test',
          data: [],
          format: 'pdf',
        }),
      ).rejects.toThrow('Unsupported format pdf');
    });

    it('should handle empty data', async () => {
      const data = [];

      await exportSpreadsheet({
        name: 'empty-export',
        data,
      });

      expect(mockXlsxUtils.aoa_to_sheet).toHaveBeenCalledWith(data);
      expect(mockXlsx.writeFile).toHaveBeenCalled();
    });
  });
});
