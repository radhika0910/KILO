// components/ui/WeightChart.tsx — Custom SVG weight chart

import React, { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Line, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/constants/Colors';
import { Typography, Radius, Shadows, Spacing } from '@/constants/Theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WeightEntry } from '@/utils/storage';

interface WeightChartProps {
  entries: WeightEntry[];
  targetWeight?: number;
  height?: number;
}

export default function WeightChart({ entries, targetWeight, height: chartHeight = 200 }: WeightChartProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const screenWidth = Dimensions.get('window').width - 64; // accounted for page and card padding

  const chartData = useMemo(() => {
    if (entries.length < 2) return null;

    // Ensure entries are sorted chronologically
    const sorted = [...entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const weights = sorted.map(e => e.weight);
    const padding = 20;
    const leftPad = 40;
    const rightPad = 45; // More room for 'Goal' text
    const topPad = 20;
    const bottomPad = 30;

    const graphWidth = screenWidth - leftPad - rightPad;
    const graphHeight = chartHeight - topPad - bottomPad;

    const minW = Math.min(...weights, targetWeight || Infinity) - 2;
    const maxW = Math.max(...weights, targetWeight || -Infinity) + 2;
    const range = maxW - minW || 1;

    // Points
    const points = sorted.map((entry, i) => ({
      x: leftPad + (i / (sorted.length - 1)) * graphWidth,
      y: topPad + (1 - (entry.weight - minW) / range) * graphHeight,
      weight: entry.weight,
      date: entry.date,
    }));

    // Smooth bezier path
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) / 3;
      const cpx2 = prev.x + (2 * (curr.x - prev.x)) / 3;
      linePath += ` C ${cpx1} ${prev.y} ${cpx2} ${curr.y} ${curr.x} ${curr.y}`;
    }

    // Fill path (close to bottom)
    const fillPath = linePath +
      ` L ${points[points.length - 1].x} ${topPad + graphHeight}` +
      ` L ${points[0].x} ${topPad + graphHeight} Z`;

    // Target line Y
    const targetY = targetWeight
      ? topPad + (1 - (targetWeight - minW) / range) * graphHeight
      : null;

    // Grid lines (5 horizontal)
    const gridLines = [];
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      const y = topPad + (i / gridCount) * graphHeight;
      const val = maxW - (i / gridCount) * range;
      gridLines.push({ y, label: val.toFixed(1) });
    }

    // X labels (show max 5)
    const xLabels: Array<{ x: number; label: string }> = [];
    const step = Math.max(1, Math.floor(sorted.length / 5));
    for (let i = 0; i < sorted.length; i += step) {
      const d = new Date(sorted[i].date);
      xLabels.push({
        x: points[i].x,
        label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      });
    }
    // Always include last
    if (xLabels.length > 0) {
      const lastIdx = sorted.length - 1;
      const lastX = points[lastIdx].x;
      if (Math.abs(lastX - xLabels[xLabels.length - 1].x) > 30) {
        const d = new Date(sorted[lastIdx].date);
        xLabels.push({
          x: lastX,
          label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        });
      }
    }

    return { points, linePath, fillPath, targetY, gridLines, xLabels, leftPad, topPad, graphWidth, graphHeight };
  }, [entries, targetWeight, screenWidth, chartHeight]);

  if (!chartData || entries.length < 2) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.emptyIcon]}>📊</Text>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Log at least 2 entries to see your chart
        </Text>
      </View>
    );
  }

  const sortedForTooltip = useMemo(() => {
    return [...entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [entries]);

  const selectedEntry = selectedPoint !== null ? sortedForTooltip[selectedPoint] : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {/* Tooltip */}
      {selectedEntry && selectedPoint !== null && (
        <View
          style={[
            styles.tooltip,
            {
              backgroundColor: theme.surface,
              borderColor: theme.primary,
              left: Math.min(
                Math.max(chartData.points[selectedPoint].x - 45, 10),
                screenWidth - 100
              ),
              top: Math.max(chartData.points[selectedPoint].y - 50, 5),
            },
          ]}
        >
          <Text style={[styles.tooltipValue, { color: theme.primary }]}>
            {selectedEntry.weight} kg
          </Text>
          <Text style={[styles.tooltipDate, { color: theme.textSecondary }]}>
            {new Date(selectedEntry.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
      )}

      <Svg width={screenWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.chartLine} stopOpacity="0.3" />
            <Stop offset="1" stopColor={theme.chartLine} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {chartData.gridLines.map((line, i) => (
          <React.Fragment key={`grid-${i}`}>
            <Line
              x1={chartData.leftPad}
              y1={line.y}
              x2={chartData.leftPad + chartData.graphWidth}
              y2={line.y}
              stroke={theme.chartGrid}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <SvgText
              x={chartData.leftPad - 8}
              y={line.y + 4}
              fontSize={10}
              fill={theme.textSecondary}
              textAnchor="end"
            >
              {line.label}
            </SvgText>
          </React.Fragment>
        ))}

        {/* X labels */}
        {chartData.xLabels.map((label, i) => (
          <SvgText
            key={`xlabel-${i}`}
            x={Math.min(Math.max(label.x, 20), screenWidth - 20)}
            y={chartHeight - 5}
            fontSize={9}
            fill={theme.textSecondary}
            textAnchor="middle"
          >
            {label.label}
          </SvgText>
        ))}

        {/* Target weight line */}
        {chartData.targetY && (
          <>
            <Line
              x1={chartData.leftPad}
              y1={chartData.targetY}
              x2={chartData.leftPad + chartData.graphWidth}
              y2={chartData.targetY}
              stroke={theme.accent}
              strokeWidth={1.5}
              strokeDasharray="6,4"
              opacity={0.7}
            />
            <SvgText
              x={chartData.leftPad + chartData.graphWidth + 2}
              y={chartData.targetY + 4}
              fontSize={9}
              fill={theme.accent}
              textAnchor="start"
            >
              Goal
            </SvgText>
          </>
        )}

        {/* Fill area */}
        <Path d={chartData.fillPath} fill="url(#chartGradient)" />

        {/* Line */}
        <Path
          d={chartData.linePath}
          stroke={theme.chartLine}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {chartData.points.map((point, i) => (
          <Circle
            key={`dot-${i}`}
            cx={point.x}
            cy={point.y}
            r={selectedPoint === i ? 6 : 3.5}
            fill={selectedPoint === i ? theme.primary : theme.chartDot}
            stroke={theme.card}
            strokeWidth={selectedPoint === i ? 3 : 2}
            onPress={() => setSelectedPoint(selectedPoint === i ? null : i)}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    ...Shadows.sm,
    position: 'relative',
  },
  emptyContainer: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
  tooltip: {
    position: 'absolute',
    zIndex: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    ...Shadows.md,
  },
  tooltipValue: {
    ...Typography.bodyMedium,
  },
  tooltipDate: {
    ...Typography.caption,
    marginTop: 2,
  },
});
