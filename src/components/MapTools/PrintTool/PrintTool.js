/* eslint-disable react/sort-comp */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
  Button,
  HTMLSelect,
  InputGroup,
  NumericInput,
  Radio,
  RadioGroup,
  Popover,
  PopoverInteractionKind,
  PopoverPosition,
  Spinner,
  Switch,
} from '@blueprintjs/core';
import PrintIcon from '@mui/icons-material/Print';
import translateMock from '@terralego/core/utils/translate';
import ToolButton from '../ToolButton';
import './styles.scss';

const PRINT_CLASS_PREFIX = 'visualizer__print';
const ORIENTATION_PORTRAIT = 'portrait';
const ORIENTATION_LANDSCAPE = 'landscape';

const BORDER_RADIUS_NONE = 'none';
const BORDER_RADIUS_UNIFORM = 'uniform';
const BORDER_RADIUS_CUSTOM = 'custom';

const HEADER_LAYOUT_COLUMN = 'column';
const HEADER_LAYOUT_ROW = 'row';
const HEADER_LAYOUT_ROW_REVERSE = 'row-reverse';

const TITLE_ALIGN_LEFT = 'left';
const TITLE_ALIGN_CENTER = 'center';
const TITLE_ALIGN_RIGHT = 'right';

export class PrintTool extends React.Component {
  static propTypes = {
    translate: PropTypes.func,
    onToggle: PropTypes.func,
  };

  static defaultProps = {
    translate: translateMock({
      'terralego.map.print_control.button_label': 'Print to PDF',
      'terralego.map.print_control.portrait_label': 'Portrait',
      'terralego.map.print_control.landscape_label': 'Landscape',
      'terralego.map.print_control.cancel_label': 'Cancel',
      'terralego.map.print_control.border_radius_label': 'Border radius',
      'terralego.map.print_control.border_radius_none': 'None',
      'terralego.map.print_control.border_radius_uniform': 'Uniform',
      'terralego.map.print_control.border_radius_custom': 'Custom',
      'terralego.map.print_control.title_label': 'Title',
      'terralego.map.print_control.title_placeholder': 'Enter a title...',
      'terralego.map.print_control.title_size_label': 'Size',
      'terralego.map.print_control.title_align_label': 'Alignment',
      'terralego.map.print_control.show_attribution_label': 'Show attribution',
      'terralego.map.print_control.show_scale_label': 'Show scale',
      'terralego.map.print_control.header_image_label': 'Header image',
      'terralego.map.print_control.header_layout_label': 'Layout',
      'terralego.map.print_control.header_layout_column': 'Image above title',
      'terralego.map.print_control.header_layout_row': 'Image left',
      'terralego.map.print_control.header_layout_row_reverse': 'Image right',
      'terralego.map.print_control.align_left': 'Left',
      'terralego.map.print_control.align_center': 'Center',
      'terralego.map.print_control.align_right': 'Right',
    }),
    onToggle () {},
  }

  state = {
    orientation: 'landscape',
    isOpen: false,
    isExporting: false,
    showTitle: false,
    showAttribution: true,
    showScale: true,
    showHeaderImage: false,
    hasHeaderImage: false,
    headerLayout: HEADER_LAYOUT_COLUMN,
    titleAlign: TITLE_ALIGN_CENTER,
    borderRadiusMode: BORDER_RADIUS_NONE,
    uniformBorderRadius: 0,
    borderRadiusTopLeft: 0,
    borderRadiusTopRight: 0,
    borderRadiusBottomRight: 0,
    borderRadiusBottomLeft: 0,
  };

  popoverRef = React.createRef();

  titleInputRef = React.createRef();

  titleSizeRef = React.createRef();

  getPrintTitleElement () {
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    return container.querySelector('.print-header__title');
  }

  getPrintHeaderElement () {
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    return container.querySelector('.print-header');
  }

  handleHeaderImageToggle = event => {
    const { checked } = event.target;
    const { map } = this.props;
    this.updateHeaderDisplay(checked, this.state.showTitle);
    this.setState({ showHeaderImage: checked }, () => {
      setTimeout(() => map.resize(), 100);
    });
  };

  handleHeaderLayoutChange = event => {
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    const header = this.getPrintHeaderElement();
    const layout = event.target.value;
    container.style.setProperty('--print-header-layout', layout);
    if (header) {
      header.dataset.layout = layout;
    }
    this.setState({ headerLayout: layout });
  };

  updateHeaderDisplay = (showImage, showTitle) => {
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    const header = this.getPrintHeaderElement();
    const shouldShowHeader = showImage || showTitle;
    container.style.setProperty('--print-header-display', shouldShowHeader ? 'flex' : 'none');
    container.style.setProperty('--print-header-image-display', showImage ? 'block' : 'none');
    // Initialize data-layout attribute
    if (header && !header.dataset.layout) {
      header.dataset.layout = this.state.headerLayout;
    }
  };

  handleTitleToggle = event => {
    const { checked } = event.target;
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    container.style.setProperty('--print-title-display', checked ? 'block' : 'none');
    this.updateHeaderDisplay(this.state.showHeaderImage, checked);
    this.setState({ showTitle: checked }, () => {
      // Redimensionner la carte après le changement d'affichage du titre
      setTimeout(() => map.resize(), 100);
    });
  };

  handleTitleChange = event => {
    const printTitle = this.getPrintTitleElement();
    if (printTitle) {
      printTitle.textContent = event.target.value;
    }
  };

  handleTitleSizeChange = event => {
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    container.style.setProperty('--print-title-font-size', event.target.value);
  };

  handleTitleAlignChange = event => {
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    container.style.setProperty('--print-title-align', event.target.value);
    this.setState({ titleAlign: event.target.value });
  };

  handleAttributionToggle = event => {
    const { checked } = event.target;
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    container.style.setProperty('--print-attribution-display', checked ? 'block' : 'none');
    this.setState({ showAttribution: checked });
  };

  handleScaleToggle = event => {
    const { checked } = event.target;
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    container.style.setProperty('--print-scale-display', checked ? 'block' : 'none');
    this.setState({ showScale: checked });
  };

  initTitleFromCSS () {
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    const computedStyle = getComputedStyle(container);
    const printTitle = this.getPrintTitleElement();

    const display = computedStyle.getPropertyValue('--print-title-display').trim() || 'none';
    const fontSize = computedStyle.getPropertyValue('--print-title-font-size').trim() || '24px';
    const titleAlign = computedStyle.getPropertyValue('--print-title-align').trim() || 'center';
    const titleText = printTitle ? printTitle.textContent.trim() : '';

    if (this.titleInputRef.current) {
      this.titleInputRef.current.value = titleText;
    }
    if (this.titleSizeRef.current) {
      this.titleSizeRef.current.value = fontSize;
    }

    this.setState({ titleAlign });

    return display !== 'none';
  }

  initHeaderFromCSS () {
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    const computedStyle = getComputedStyle(container);
    const header = this.getPrintHeaderElement();

    const headerImage = computedStyle.getPropertyValue('--print-header-image').trim();
    const hasHeaderImage = headerImage && headerImage !== 'none' && headerImage !== '';
    const headerLayout = computedStyle.getPropertyValue('--print-header-layout').trim() || 'column';

    if (header) {
      header.dataset.layout = headerLayout;
    }

    return { hasHeaderImage, headerLayout };
  }

  initAttributionFromCSS () {
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    const computedStyle = getComputedStyle(container);

    const display = computedStyle.getPropertyValue('--print-attribution-display').trim() || 'block';
    return display !== 'none';
  }

  initScaleFromCSS () {
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    const computedStyle = getComputedStyle(container);

    const display = computedStyle.getPropertyValue('--print-scale-display').trim() || 'block';
    return display !== 'none';
  }

  initBorderRadiusFromCSS () {
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    const computedStyle = getComputedStyle(container);

    // Lire les valeurs CSS par défaut
    const getCSSValue = varName => {
      const value = computedStyle.getPropertyValue(varName).trim();
      const parsed = parseInt(value, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    const topLeft = getCSSValue('--print-border-radius-top-left');
    const topRight = getCSSValue('--print-border-radius-top-right');
    const bottomRight = getCSSValue('--print-border-radius-bottom-right');
    const bottomLeft = getCSSValue('--print-border-radius-bottom-left');

    // Déterminer le mode en fonction des valeurs
    let borderRadiusMode = BORDER_RADIUS_NONE;
    let uniformBorderRadius = 0;

    const allZero = topLeft === 0 && topRight === 0 && bottomRight === 0 && bottomLeft === 0;
    const allEqual = topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft;

    if (allZero) {
      borderRadiusMode = BORDER_RADIUS_NONE;
    } else if (allEqual) {
      borderRadiusMode = BORDER_RADIUS_UNIFORM;
      uniformBorderRadius = topLeft;
    } else {
      borderRadiusMode = BORDER_RADIUS_CUSTOM;
    }

    this.setState({
      borderRadiusMode,
      uniformBorderRadius,
      borderRadiusTopLeft: topLeft,
      borderRadiusTopRight: topRight,
      borderRadiusBottomRight: bottomRight,
      borderRadiusBottomLeft: bottomLeft,
    });
  }

  setBorderRadiusVariables () {
    const {
      borderRadiusMode,
      uniformBorderRadius,
      borderRadiusTopLeft,
      borderRadiusTopRight,
      borderRadiusBottomRight,
      borderRadiusBottomLeft,
    } = this.state;
    const { map } = this.props;
    const container = map.getContainer().parentElement;

    let topLeft = 0;
    let topRight = 0;
    let bottomRight = 0;
    let bottomLeft = 0;

    if (borderRadiusMode === BORDER_RADIUS_UNIFORM) {
      topLeft = uniformBorderRadius;
      topRight = uniformBorderRadius;
      bottomRight = uniformBorderRadius;
      bottomLeft = uniformBorderRadius;
    } else if (borderRadiusMode === BORDER_RADIUS_CUSTOM) {
      topLeft = borderRadiusTopLeft;
      topRight = borderRadiusTopRight;
      bottomRight = borderRadiusBottomRight;
      bottomLeft = borderRadiusBottomLeft;
    }

    container.style.setProperty('--print-border-radius-top-left', `${topLeft}px`);
    container.style.setProperty('--print-border-radius-top-right', `${topRight}px`);
    container.style.setProperty('--print-border-radius-bottom-right', `${bottomRight}px`);
    container.style.setProperty('--print-border-radius-bottom-left', `${bottomLeft}px`);
  }

  handleBorderRadiusChange = (corner, value) => {
    const numValue = Number.isNaN(value) ? 0 : value;
    this.setState({ [corner]: numValue }, () => this.setBorderRadiusVariables());
  };

  handleBorderRadiusModeChange = ({ target: { value: borderRadiusMode } }) => {
    this.setState({ borderRadiusMode }, () => this.setBorderRadiusVariables());
  };

  handleUniformBorderRadiusChange = value => {
    const numValue = Number.isNaN(value) ? 0 : value;
    this.setState({ uniformBorderRadius: numValue }, () => this.setBorderRadiusVariables());
  };

  setClasses () {
    const { orientation, isOpen } = this.state;
    const { map } = this.props;
    const container = map.getContainer().parentElement;
    const isPortrait = orientation === ORIENTATION_PORTRAIT;
    const forDeletion = [
      PRINT_CLASS_PREFIX,
      `${PRINT_CLASS_PREFIX}--${ORIENTATION_PORTRAIT}`,
      `${PRINT_CLASS_PREFIX}--${ORIENTATION_LANDSCAPE}`,
    ];
    const oldClasses = container.className.split(' ').filter(item => !forDeletion.includes(item));
    container.className = classnames(
      ...oldClasses,
      isOpen && PRINT_CLASS_PREFIX,
      isOpen && isPortrait && `${PRINT_CLASS_PREFIX}--${ORIENTATION_PORTRAIT}`,
      isOpen && !isPortrait && `${PRINT_CLASS_PREFIX}--${ORIENTATION_LANDSCAPE}`,
    );
    this.setBorderRadiusVariables();
    this.popoverRef.current.reposition();
    map.resize();
  }

  handleInteraction = nextOpenedState => {
    const { onToggle } = this.props;
    onToggle(nextOpenedState);
    if (nextOpenedState) {
      this.initBorderRadiusFromCSS();
      const showTitle = this.initTitleFromCSS();
      const showAttribution = this.initAttributionFromCSS();
      const showScale = this.initScaleFromCSS();
      const { hasHeaderImage, headerLayout } = this.initHeaderFromCSS();
      this.setState({
        showTitle,
        showAttribution,
        showScale,
        hasHeaderImage,
        showHeaderImage: hasHeaderImage,
        headerLayout,
      }, () => {
        this.updateHeaderDisplay(hasHeaderImage, showTitle);
      });
    }

    setTimeout(() => this.setState({
      isOpen: nextOpenedState,
    }, this.setClasses), 500);
  };

  handleDisposition = ({ target: { value: orientation } }) =>
    this.setState({ orientation }, this.setClasses);

  beginGeneration = () => this.setState({ isExporting: true }, async () => {
    const { orientation } = this.state;
    const { map } = this.props;
    // dirty tricks to quickly fixt pdf printing
    setTimeout(() => global.dispatchEvent(new Event('resize')), 2000);
    const { default: exportPdf } = await import('./export');
    await exportPdf(map, orientation);
    this.setState({
      isOpen: false,
      isExporting: false,
    }, this.setClasses);
  });

  renderContent () {
    const { translate } = this.props;
    const {
      orientation,
      isExporting,
      showTitle,
      showAttribution,
      showScale,
      showHeaderImage,
      hasHeaderImage,
      headerLayout,
      titleAlign,
      borderRadiusMode,
      uniformBorderRadius,
      borderRadiusTopLeft,
      borderRadiusTopRight,
      borderRadiusBottomRight,
      borderRadiusBottomLeft,
    } = this.state;

    return (
      <>
        <RadioGroup
          label="Disposition"
          onChange={this.handleDisposition}
          selectedValue={orientation}
        >
          <Radio
            value={ORIENTATION_PORTRAIT}
            label={translate('terralego.map.print_control.portrait_label')}
          />
          <Radio
            value={ORIENTATION_LANDSCAPE}
            label={translate('terralego.map.print_control.landscape_label')}
          />
        </RadioGroup>
        {hasHeaderImage && (
          <div className="print-control__header-section">
            <Switch
              checked={showHeaderImage}
              onChange={this.handleHeaderImageToggle}
              label={translate('terralego.map.print_control.header_image_label')}
            />
            {showHeaderImage && (
              <div className="print-control__header-layout">
                <HTMLSelect
                  value={headerLayout}
                  onChange={this.handleHeaderLayoutChange}
                  options={[
                    { value: HEADER_LAYOUT_COLUMN, label: translate('terralego.map.print_control.header_layout_column') },
                    { value: HEADER_LAYOUT_ROW, label: translate('terralego.map.print_control.header_layout_row') },
                    { value: HEADER_LAYOUT_ROW_REVERSE, label: translate('terralego.map.print_control.header_layout_row_reverse') },
                  ]}
                  fill
                />
              </div>
            )}
          </div>
        )}
        <div className="print-control__title-section">
          <Switch
            checked={showTitle}
            onChange={this.handleTitleToggle}
            label={translate('terralego.map.print_control.title_label')}
          />
          {showTitle && (
            <div className="print-control__title-inputs">
              <InputGroup
                inputRef={this.titleInputRef}
                placeholder={translate('terralego.map.print_control.title_placeholder')}
                onChange={this.handleTitleChange}
                fill
              />
              <HTMLSelect
                elementRef={this.titleSizeRef}
                onChange={this.handleTitleSizeChange}
                options={[
                  { value: '16px', label: '16px' },
                  { value: '20px', label: '20px' },
                  { value: '24px', label: '24px' },
                  { value: '28px', label: '28px' },
                  { value: '32px', label: '32px' },
                  { value: '36px', label: '36px' },
                  { value: '48px', label: '48px' },
                ]}
              />
              <HTMLSelect
                value={titleAlign}
                style={{ minWidth: '80px' }}
                onChange={this.handleTitleAlignChange}
                options={[
                  { value: TITLE_ALIGN_LEFT, label: translate('terralego.map.print_control.align_left') },
                  { value: TITLE_ALIGN_CENTER, label: translate('terralego.map.print_control.align_center') },
                  { value: TITLE_ALIGN_RIGHT, label: translate('terralego.map.print_control.align_right') },
                ]}
              />
            </div>
          )}
        </div>
        <Switch
          checked={showAttribution}
          onChange={this.handleAttributionToggle}
          label={translate('terralego.map.print_control.show_attribution_label')}
        />
        <Switch
          checked={showScale}
          onChange={this.handleScaleToggle}
          label={translate('terralego.map.print_control.show_scale_label')}
        />
        <RadioGroup
          label={translate('terralego.map.print_control.border_radius_label')}
          onChange={this.handleBorderRadiusModeChange}
          selectedValue={borderRadiusMode}
          className="print-control__border-radius"
        >
          <Radio
            value={BORDER_RADIUS_NONE}
            label={translate('terralego.map.print_control.border_radius_none')}
          />
          <Radio
            value={BORDER_RADIUS_UNIFORM}
            label={translate('terralego.map.print_control.border_radius_uniform')}
          />
          <Radio
            value={BORDER_RADIUS_CUSTOM}
            label={translate('terralego.map.print_control.border_radius_custom')}
          />
        </RadioGroup>
        {borderRadiusMode === BORDER_RADIUS_UNIFORM && (
          <div className="print-control__border-radius-inputs">
            <NumericInput
              value={uniformBorderRadius}
              onValueChange={this.handleUniformBorderRadiusChange}
              min={0}
              max={200}
              stepSize={5}
              minorStepSize={1}
              leftIcon="border-radius"
              fill
            />
          </div>
        )}
        {borderRadiusMode === BORDER_RADIUS_CUSTOM && (
          <div className="print-control__border-radius-inputs print-control__border-radius-grid">
            <NumericInput
              value={borderRadiusTopLeft}
              onValueChange={value => this.handleBorderRadiusChange('borderRadiusTopLeft', value)}
              min={0}
              max={200}
              stepSize={5}
              minorStepSize={1}
              leftIcon="arrow-top-left"
              fill
            />
            <NumericInput
              value={borderRadiusTopRight}
              onValueChange={value => this.handleBorderRadiusChange('borderRadiusTopRight', value)}
              min={0}
              max={200}
              stepSize={5}
              minorStepSize={1}
              leftIcon="arrow-top-right"
              fill
            />
            <NumericInput
              value={borderRadiusBottomLeft}
              onValueChange={value => this.handleBorderRadiusChange('borderRadiusBottomLeft', value)}
              min={0}
              max={200}
              stepSize={5}
              minorStepSize={1}
              leftIcon="arrow-bottom-left"
              fill
            />
            <NumericInput
              value={borderRadiusBottomRight}
              onValueChange={value => this.handleBorderRadiusChange('borderRadiusBottomRight', value)}
              min={0}
              max={200}
              stepSize={5}
              minorStepSize={1}
              leftIcon="arrow-bottom-right"
              fill
            />
          </div>
        )}
        <Button onClick={this.beginGeneration} disabled={isExporting}>
          {isExporting
            ? <Spinner size={16} />
            : translate('terralego.map.print_control.button_label')}
        </Button>
        <Button
          onClick={() => this.handleInteraction(false)}
          intent="danger"
        >
          {translate('terralego.map.print_control.cancel_label')}
        </Button>
      </>
    );
  }

  render () {
    const { translate } = this.props;
    const { isOpen } = this.state;

    return (
      <Popover
        className="popoverPos"
        position={PopoverPosition.AUTO_START}
        interactionKind={PopoverInteractionKind.CLICK_TARGET_ONLY}
        onInteraction={this.handleInteraction}
        isOpen={isOpen}
        ref={this.popoverRef}
        content={this.renderContent()}
      >
        <ToolButton
          label={translate('terralego.map.print_control.button_label')}
          icon={<PrintIcon sx={{ fontSize: 20 }} />}
          isActive={isOpen}
        />
      </Popover>
    );
  }
}

export default PrintTool;
