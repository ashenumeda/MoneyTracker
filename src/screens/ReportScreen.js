import React, {useState, useCallback} from 'react';
import { ScrollView, StyleSheet, Dimensions, View } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions } from '../db/database';

const CHART_WIDTH = Dimensions.get('window').width - 32;

const processData = (transactions, period) => {
  const categories = {};
  const timeline = {};
  const now = new Date();

  const colors = [
    'rgba(131, 167, 234, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
  ];
  let colorIdx = 0;

  transactions.forEach(tx => {
    if (tx.account_type !== 'expense') return;

    const d = new Date(tx.date);
    let timeKey;

    if (period === 'day') {
      timeKey = tx.date;
    } else if (period === 'week') {
      const diffDays = Math.floor((now - d) / 86400000);
      if (diffDays > 6) return;
      // Get standard short weekday name
      timeKey = d.toLocaleDateString('en-US', { weekday: 'short' }); 
    } else {
      timeKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (!categories[tx.account_name]) {
      categories[tx.account_name] = { 
        name: tx.account_name, 
        amount: 0, 
        color: colors[colorIdx++ % colors.length], 
        legendFontColor: '#7F7F7F', 
        legendFontSize: 12 
      };
    }
    categories[tx.account_name].amount += tx.amount;

    if (!timeline[timeKey]) timeline[timeKey] = 0;
    timeline[timeKey] += tx.amount;
  });

  const timelineSortedLabels = Object.keys(timeline);
  const timelineAmounts = timelineSortedLabels.map(l => timeline[l]);

  return {
    pieData: Object.values(categories),
    lineData: {
      labels: timelineSortedLabels.length ? timelineSortedLabels : ['No Data'],
      datasets: [{ data: timelineAmounts.length ? timelineAmounts : [0] }]
    }
  };
};

export default function ReportScreen() {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState({ pieData: [], lineData: { labels: ['No Data'], datasets: [{data: [0]}] } });

  useFocusEffect(
    useCallback(() => {
      getTransactions().then(txs => {
        setData(processData(txs, period));
      });
    }, [period])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SegmentedButtons
        value={period}
        onValueChange={setPeriod}
        buttons={[
          { value: 'day',   label: 'Daily'   },
          { value: 'week',  label: 'Weekly'  },
          { value: 'month', label: 'Monthly' },
        ]}
        style={styles.segment}
      />

      <Text variant="titleMedium" style={styles.title}>Expenses by Category</Text>
      {data.pieData.length > 0 ? (
        <View style={styles.chartWrapper}>
          <PieChart
            data={data.pieData}
            width={CHART_WIDTH}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      ) : (
        <Text style={styles.noData}>No expenses for this period</Text>
      )}

      <Text variant="titleMedium" style={[styles.title, {marginTop: 20}]}>Total Expenses Trend</Text>
      <View style={styles.chartWrapper}>
        <LineChart
          data={data.lineData}
          width={CHART_WIDTH}
          height={220}
          yAxisLabel="$"
          yAxisInterval={1}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(21, 101, 192, ${opacity})`,
  labelColor: () => '#555',
  propsForBackgroundLines: { strokeDasharray: '' },
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, backgroundColor: '#f5f5f5' },
  segment:   { marginBottom: 16 },
  title:     { marginBottom: 12, color: '#333', fontWeight: 'bold' },
  chartWrapper: { backgroundColor: '#fff', borderRadius: 8, elevation: 2, paddingVertical: 10, alignItems: 'center' },
  chart:     { borderRadius: 8 },
  noData: { textAlign: 'center', marginVertical: 20, color: '#888' },
});