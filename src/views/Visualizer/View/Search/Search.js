import React from 'react';
import { InputGroup } from '@blueprintjs/core';

import './styles.scss';

export const Search = ({ onChange, value }) => (
  <div className="bp3-dark search">
    <label htmlFor="visualiser-search" className="search__label">Rechercher</label>
    <InputGroup
      id="visualiser-search"
      className="search__input"
      type="search"
      onChange={onChange}
      value={value}
      placeholder="Que recherchez-vous ?"
      leftIcon="search"
      large
    />
  </div>
);

export default Search;
