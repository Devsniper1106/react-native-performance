import React from 'react';
import { FlexRow, styled, Text } from 'flipper';
import { METRICS } from './constants';
import {
  BarHorizontalRounded,
  BarHorizontalSegment,
  COLOR_TEXT,
  MARGIN_CONTAINER_VERTICAL,
  MARGIN_CONTAINER_HORIZONTAL,
} from './ui';
import { formatTime } from './lib/formatTime';
import { getTotalMetricSum } from './lib/getTotalMetricSum';

const findSlowestDuration = (sessions, metrics) =>
  sessions.reduce(
    (slowestDuration, session) =>
      Math.max(slowestDuration, getTotalMetricSum(session, metrics)),
    0
  );

const ROW_VERTICAL_PADDING = MARGIN_CONTAINER_HORIZONTAL / 2;
const ROW_LABEL_WIDTH = 90;

const BarRow = styled('tr')({
  '&>.actions': {
    visibility: 'hidden',
  },
  '&:hover>.actions': {
    visibility: 'visible',
  },
});

const BarLabel = styled('th')({
  color: COLOR_TEXT,
  fontSize: 13,
  width: ROW_LABEL_WIDTH + MARGIN_CONTAINER_HORIZONTAL,
  paddingLeft: MARGIN_CONTAINER_HORIZONTAL,
  paddingTop: ROW_VERTICAL_PADDING,
  paddingBottom: ROW_VERTICAL_PADDING,
  textAlign: 'left',
  verticalAlign: 'middle',
});

const BarValue = styled('td')({
  paddingTop: ROW_VERTICAL_PADDING,
  paddingBottom: ROW_VERTICAL_PADDING,
});

const BarActions = styled('td')({
  width: MARGIN_CONTAINER_HORIZONTAL,
  textAlign: 'center',
  verticalAlign: 'middle',
});

const BUTTON_SIZE = 24;
const COLOR_HOVER = '#F2F2F2';
const COLOR_ACTIVE = '#e0e0e0';

const RemoveButtonText = props => <Text {...props}>&times;</Text>;

const RemoveButton = styled(RemoveButtonText)({
  display: 'inline-block',
  fontSize: 16,
  textAlign: 'center',
  lineHeight: 1.35,
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  borderRadius: BUTTON_SIZE / 2,
  borderWidth: 1,
  borderColor: 'transparent',
  borderStyle: 'solid',
  color: COLOR_TEXT,
  '&:hover': {
    backgroundColor: COLOR_HOVER,
    borderColor: COLOR_ACTIVE,
  },
  '&:active': {
    backgroundColor: COLOR_ACTIVE,
    borderColor: COLOR_ACTIVE,
  },
});

const SessionRow = React.memo(
  ({ relativeDuration, includedMetrics, onSessionRemoveClick, session }) => {
    const {
      sessionStartedAt,
      nativeStartup,
      bundleSize,
      scriptDownload,
      scriptExecution,
      tti,
    } = session;
    const totalDuration = getTotalMetricSum(session, includedMetrics);
    const startDate = new Date(sessionStartedAt);
    const handleRemoveClick = React.useCallback(
      () => onSessionRemoveClick(session),
      [onSessionRemoveClick, session]
    );

    return (
      <BarRow>
        <BarLabel>{formatTime(startDate)}</BarLabel>
        <BarValue>
          <BarHorizontalRounded
            width={Math.round((totalDuration / relativeDuration) * 100) + '%'}
          >
            {METRICS.filter(
              metric => includedMetrics.has(metric.key) && session[metric.key]
            ).map(metric => (
              <BarHorizontalSegment
                relativeSize={session[metric.key] / totalDuration}
                color={metric.color}
              />
            ))}
          </BarHorizontalRounded>
        </BarValue>
        <BarActions className="actions">
          <RemoveButton onClick={handleRemoveClick} />
        </BarActions>
      </BarRow>
    );
  }
);

const TableFullWidth = styled('table')({
  width: '100%',
  marginTop: MARGIN_CONTAINER_VERTICAL,
  marginBottom: MARGIN_CONTAINER_VERTICAL,
});

export const StartupTable = ({
  sessions,
  includedMetrics,
  onSessionRemoveClick,
}) => {
  const slowestDuration = findSlowestDuration(sessions, includedMetrics);

  return (
    <TableFullWidth>
      <tbody>
        {sessions.map(session => (
          <SessionRow
            session={session}
            includedMetrics={includedMetrics}
            relativeDuration={slowestDuration}
            onSessionRemoveClick={onSessionRemoveClick}
          />
        ))}
      </tbody>
    </TableFullWidth>
  );
};
