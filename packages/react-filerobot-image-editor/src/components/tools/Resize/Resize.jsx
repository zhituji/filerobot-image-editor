/** External Dependencies */
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@scaleflex/ui/core/button';
import LockOutline from '@scaleflex/icons/lock-outline';
import UnlockOutline from '@scaleflex/icons/unlock-outline';

/** Internal Dependencies */
import { SET_RESIZE } from 'actions';
import restrictNumber from 'utils/restrictNumber';
import { useStore } from 'hooks';
import getProperDimensiosns from 'utils/getProperDimensions';
import {
  StyledResizeWrapper,
  StyledResizeInput,
  StyledRatioLockIcon,
  StyledXLabel,
} from './Resize.styled';

const Resize = ({ onChange, currentSize, hideResetButton, alignLeft }) => {
  const {
    dispatch,
    originalImage,
    resize,
    shownImageDimensions,
    adjustments: { crop },
    theme,
    t,
  } = useStore();

  const changeResize = (e) => {
    const { name, value } = e.target;

    const newResize = {
      [name]: restrictNumber(value, 1, originalImage[name]),
    };
    const isHeight = name === 'height';
    const secondDimensionName = isHeight ? 'width' : 'height';
    const isRatioUnlocked = currentSize.ratioUnlocked ?? resize.ratioUnlocked;
    if (!isRatioUnlocked) {
      const originalImgRatio = originalImage.width / originalImage.height;
      newResize[secondDimensionName] = isHeight
        ? Math.round(newResize[name] * originalImgRatio)
        : Math.round(newResize[name] / originalImgRatio);
    }

    if (
      newResize[name] === resize[name] &&
      newResize[secondDimensionName] === resize[secondDimensionName]
    ) {
      return;
    }

    if (typeof onChange === 'function') {
      onChange(newResize);
      return;
    }

    dispatch({
      type: SET_RESIZE,
      payload: newResize,
    });
  };

  const toggleRatioLock = () => {
    if (typeof onChange === 'function') {
      onChange({ ratioUnlocked: !currentSize.ratioUnlocked });
      return;
    }

    dispatch({
      type: SET_RESIZE,
      payload: {
        ratioUnlocked: !resize.ratioUnlocked,
      },
    });
  };

  const resetResize = () => {
    dispatch({
      type: SET_RESIZE,
      payload: {
        width: null,
        height: null,
        ratioUnlocked: false,
      },
    });
  };

  const isOriginalSize =
    (!resize.width && !resize.height) ||
    (originalImage.width === resize.width &&
      originalImage.height === resize.height);

  const dimensions = getProperDimensiosns(
    ((currentSize.width || currentSize.height) && currentSize) || resize,
    crop,
    shownImageDimensions,
    originalImage,
  );
  return (
    <StyledResizeWrapper alignLeft={alignLeft}>
      <StyledResizeInput
        value={dimensions.width}
        name="width"
        onChange={changeResize}
        inputMode="numeric"
        title={t('resizeWidthTitle')}
        type="number"
        size="sm"
        placeholder="Width"
        noLeftMargin={alignLeft}
      />
      <StyledXLabel>x</StyledXLabel>
      <StyledResizeInput
        value={dimensions.height}
        name="height"
        onChange={changeResize}
        inputMode="numeric"
        title={t('resizeHeightTitle')}
        type="number"
        size="sm"
        placeholder="Height"
      />
      <StyledRatioLockIcon
        title={t('toggleRatioLockTitle')}
        onClick={toggleRatioLock}
        color="link"
        size="sm"
      >
        {currentSize.ratioUnlocked || resize.ratioUnlocked ? (
          <UnlockOutline color={theme.palette['icons-secondary']} />
        ) : (
          <LockOutline color={theme.palette['icons-secondary']} />
        )}
      </StyledRatioLockIcon>
      {!hideResetButton && (
        <Button
          size="sm"
          onClick={isOriginalSize ? undefined : resetResize}
          disabled={isOriginalSize}
          title={t('resetSize')}
        >
          {t('reset')}
        </Button>
      )}
    </StyledResizeWrapper>
  );
};

Resize.defaultProps = {
  onChange: undefined,
  currentSize: {},
  hideResetButton: false,
  alignLeft: false,
};

Resize.propTypes = {
  alignLeft: PropTypes.bool,
  hideResetButton: PropTypes.bool,
  onChange: PropTypes.func,
  currentSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
    ratioUnlocked: false,
  }),
};

export default Resize;
