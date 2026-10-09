import ReportIcon from '@mui/icons-material/Report';
import PropTypes from 'prop-types';
import React from 'react';

import useDeclarationConfig from '../DeclarationModule/useDeclarationConfig';
import ToolButton from './ToolButton';
import ToolGroup from './ToolGroup';

const DeclarationTool = ({ isOpen, onToggle }) => {
  const declarationConfig = useDeclarationConfig();

  if (!declarationConfig) return null;

  return (
    <ToolGroup>
      <ToolButton
        label="Déclaration"
        icon={<ReportIcon sx={{ fontSize: 20 }} />}
        isActive={isOpen}
        onClick={onToggle}
      />
    </ToolGroup>
  );
};

DeclarationTool.propTypes = {
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
};

DeclarationTool.defaultProps = {
  isOpen: false,
};

export default DeclarationTool;
