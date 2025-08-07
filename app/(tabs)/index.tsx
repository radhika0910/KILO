import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import {
  Alert,
  Button,
  FlatList,
  LayoutAnimation,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  useColorScheme,
  View
} from 'react-native';

interface Entry {
  weight: number;
  targetWeight: number;
  height: number;
  age: number;
  date: string;
  bmi: number;
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const [data, setData] = useState<Entry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ weight: '', targetWeight: '', height: '', age: '' });
  const colorScheme = useColorScheme() || 'light';
  const theme = Colors[colorScheme];
const [timeRange, setTimeRange] = useState<'week' | 'month' | '6months' | 'year' | 'all'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const json = await AsyncStorage.getItem('weightData');
    if (json) {
      setData(JSON.parse(json));
    } else {
      setModalVisible(true);
    }
  };

  const handleSaveData = () => {
  const weight = parseFloat(form.weight);
  const targetWeight = latest?.targetWeight ?? parseFloat(form.targetWeight);
  const height = latest?.height ?? parseFloat(form.height);
  const age = latest?.age ?? parseInt(form.age);

  if (!weight || (!targetWeight && !latest?.targetWeight) || (!height && !latest?.height) || (!age && !latest?.age)) {
    Alert.alert('Missing Info', 'Please fill in all required fields.');
    return;
  }

  const bmi = +(weight / ((height / 100) ** 2)).toFixed(1);
  const newEntry: Entry = {
    weight,
    targetWeight,
    height,
    age,
    date: new Date().toLocaleString(),
    bmi,
  };

  const updatedData = [...data, newEntry];
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setData(updatedData);
  AsyncStorage.setItem('weightData', JSON.stringify(updatedData));
  setModalVisible(false);
  setForm({ weight: '', targetWeight: '', height: '', age: '' });
};


  const deleteEntry = async (indexToDelete: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updatedData = data.filter((_, i) => i !== indexToDelete);
    setData(updatedData);
    await AsyncStorage.setItem('weightData', JSON.stringify(updatedData));
  };

  const getFilteredData = () => {
  const now = new Date();
  let fromDate = new Date();

  switch (timeRange) {
    case 'week':
      fromDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      fromDate.setMonth(now.getMonth() - 1);
      break;
    case '6months':
      fromDate.setMonth(now.getMonth() - 6);
      break;
    case 'year':
      fromDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
    default:
      return data;
  }

  return data.filter((entry) => new Date(entry.date) >= fromDate);
};

const filteredData = getFilteredData();

  const latest = data[data.length - 1];

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      {latest && (
        <View style={styles.container}>
          <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <Text style={[styles.cardTitle, { color: theme.cardText }]}>Weight</Text>
            <Text style={[styles.cardValue, { color: theme.highlight }]}>{latest.weight} kg</Text>
          </View>
          <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <Text style={[styles.cardTitle, { color: theme.cardText }]}>Target</Text>
            <Text style={[styles.cardValue, { color: theme.highlight }]}>{latest.targetWeight} kg</Text>
          </View>
          <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <Text style={[styles.cardTitle, { color: theme.cardText }]}>BMI</Text>
            <Text style={[styles.cardValue, { color: theme.highlight }]}>{latest.bmi}</Text>
          </View>
        </View>
      )}


 {filteredData.length > 1 && (
  <View style={{ marginBottom: 20 }}>
    <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
      📈 Weight Progress
    </Text>

    {/* Buttons Here */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
  {['week', 'month', '6months', 'year', 'all'].map((range) => (
    <TouchableOpacity
      key={range}
      onPress={() => setTimeRange(range as any)}
      style={{
        backgroundColor: timeRange === range ? theme.highlight : theme.card,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginRight: 4,
      }}
    >
      <Text style={{ color: theme.text, fontSize: 12 }}>
        {range === '6months' ? '6M' : range.charAt(0).toUpperCase() + range.slice(1)}
      </Text>
    </TouchableOpacity>
  ))}
</View>

    {/* Line Chart */}
    <LineChart
      data={{
        labels: filteredData.map((entry, index) =>
          index % 2 === 0
            ? new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
            : ''
        ),
        datasets: [
          {
            data: filteredData.map((entry) => entry.weight),
            color: () => theme.highlight,
          },
        ],
      }}
      width={Dimensions.get('window').width - 32}
      height={200}
      yAxisSuffix="kg"
      chartConfig={{
        backgroundGradientFrom: theme.background,
        backgroundGradientTo: theme.background,
        decimalPlaces: 1,
        color: () => theme.text,
        labelColor: () => theme.text,
        propsForDots: {
          r: '3',
          strokeWidth: '1',
          stroke: theme.highlight,
        },
        propsForBackgroundLines: {
          stroke: 'transparent',
        },
      }}
      bezier
      style={{ borderRadius: 12 }}
    />
  </View>
)}



      <View style={styles.logHeader}>
        <Text style={[styles.logTitle, { color: theme.text }]}>📊 Logged Entries</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={[styles.addBtn, { color: theme.highlight }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...data].reverse()}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
  const originalIndex = data.length - 1 - index;
  return (
    <View style={[styles.logItem, { borderBottomColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
  <View>
    <Text style={{ color: theme.text }}>{item.date}</Text>
    <Text style={{ color: theme.text }}>
      Weight: {item.weight}kg 
    </Text>
  </View>

  <Text style={{ fontSize: 14, padding: 4, color: theme.highlight }}>
    {Math.abs(item.weight - item.targetWeight).toFixed(1)} kg away
  </Text>
</View>

  );
}}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
  <View style={styles.modalWrapper}>
    <View style={[styles.modal, { backgroundColor: theme.modalBg }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[styles.modalTitle, { color: theme.text }]}>Enter your data</Text>
        <TouchableOpacity onPress={() => setModalVisible(false)}>
          <Text style={{ color: theme.highlight, fontWeight: 'bold', fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
      </View>

      {['weight', 'targetWeight', 'height', 'age'].map((field) => {
        if ((field === 'age' || field === 'height' || field === 'targetWeight') && latest?.[field]) {
          return null; // hide if already entered
        }
        return (
          <TextInput
            key={field}
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            placeholderTextColor={theme.icon}
            keyboardType="numeric"
            value={form[field as keyof typeof form]}
            onChangeText={(val) => setForm({ ...form, [field]: val })}
          />
        );
      })}

      <Button title="Save" onPress={handleSaveData} />
    </View>
  </View>
</Modal>

    </View>
  );

  
}
const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  card: {
    width: 100,
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addBtn: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logItem: {
    padding: 8,
    borderBottomWidth: 1,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  modal: {
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
});
