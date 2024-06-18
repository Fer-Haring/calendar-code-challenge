import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, Text, View, StyleSheet } from 'react-native';
import { Action, ChallengeData, CalendarData, Customer } from '../models/ChallengeData';
import { CheckCircleIcon } from "react-native-heroicons/solid";
import { ClockIcon } from "react-native-heroicons/outline";

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calendar() {
  const [events, setEvents] = useState<Map<string, Action[]>>(new Map());
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetch('https://xjvq5wtiye.execute-api.us-east-1.amazonaws.com/interview/api/v1/challenge')
      .then(response => response.json())
      .then((data: ChallengeData) => {
        console.log(data);
        const parsedEvents = parseEvents(data.calendar);
        setEvents(parsedEvents);
        setCustomer(data.customer); // Guardar datos del cliente
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const parseEvents = (calendar: CalendarData[]): Map<string, Action[]> => {
    const events = new Map<string, Action[]>();

    calendar.forEach(monthData => {
      if (monthData.month === 0) return; // Ignorar mes 0
      const key = `${monthNames[monthData.month - 1]} ${monthData.year}`;
      if (!events.has(key)) {
        events.set(key, []);
      }
      events.get(key)?.push(...monthData.actions);
    });

    return events;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Completed':
        return '#00B47D';
      case 'Scheduled':
        return '#006A4B';
      default:
        return '#011638';
    }
  };

  const formatScheduledDay = (dateString?: string): string => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return `${date.toDateString().split(' ')[0]}`;
  };

  const formatScheduledDayNumber = (dateString?: string): string => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return `${date.getDate()}`;
  };

  console.log(events);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Calendar</Text>
      </View>
      <ScrollView>
        {Array.from(events.entries()).map(([key, actions]) => (
          <View key={key} style={styles.container}>
            <Text style={styles.monthHeader}>{key}</Text>
            {actions.length === 0 ? (
              <View style={styles.noMaintenance}>
                <Text style={styles.noMaintenanceText}>No Maintenance Scheduled</Text>
              </View>
            ) : (
              actions.map((event) => (
                <View key={event.id} style={styles.mainContainer}>
                  {event.status === 'Unscheduled' ? (
                    <View style={styles.eventHeader} >
                      <Text style={styles.dateDay}>{formatScheduledDay(event.scheduledDate)}</Text>
                    </View>
                  ) : (
                    <View style={styles.eventHeader}>
                      <Text style={styles.dateDay}>{formatScheduledDay(event.scheduledDate)}</Text>
                      <Text style={styles.dateDayNumber}>{formatScheduledDayNumber(event.scheduledDate)}</Text>
                      {event.status === 'Completed' ? <CheckCircleIcon size={14} color={'#00B47D'} /> : <ClockIcon size={14} color={'#00B47D'} />}
                    </View>
                  )}
                  <View key={event.id} style={[styles.eventCard, { backgroundColor: getStatusColor(event.status) }]}>
                    <Text style={styles.title}>{event.name}</Text>
                    {event.status !== 'Unschedule' && (
                      <View>
                        <Text style={styles.company}>{event.vendor?.vendorName || ''}</Text>
                        <Text style={styles.phone}>{event.vendor?.phoneNumber || ''}</Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginLeft: 16 }}>
                      <Ionicons name="location" size={16} color="white" />
                      <Text style={styles.address}>{customer?.street || ''}</Text>
                    </View>
                    <Text style={styles.status}>
                      {event.status === 'Scheduled' ? (
                        `Scheduled ${event.arrivalStartWindow || ''} - ${event.arrivalEndWindow || ''}`
                      ) : (
                        <Text style={{
                          fontFamily: 'Lato',
                        }}>
                          Schedule date & time TBD
                        </Text>
                      )}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  header: {
    padding: 10,
    borderBottomColor: '#DCDCDC',
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Lato',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  monthHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    padding: 10,
    textAlign: 'left',
    fontFamily: 'Lato'
  },
  noMaintenance: {
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#848FA5',
    color: '#fff',
    paddingLeft: 16,
    marginLeft: 52,
    borderRadius: 4,
    marginHorizontal: 16,
  },
  noMaintenanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Lato'
  },
  mainContainer: {
    flexDirection: 'row',
  },
  eventCard: {
    flex: 1,
    borderRadius: 4,
    padding: 4,
    marginVertical: 4,
    marginHorizontal: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  eventHeader: {
    flex: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 5,
    width: 26,
    marginVertical: 4,
  },
  dateDay: {
    fontSize: 9,
    fontWeight: 'normal',
    color: 'black',
    fontFamily: 'Lato'
  },
  dateDayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'Lato'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 9,
    marginLeft: 16,
    fontFamily: 'Lato'
  },
  company: {
    fontSize: 14,
    color: 'white',
    marginLeft: 16,
    fontFamily: 'Lato'
  },
  phone: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 16,
    fontFamily: 'Lato'
  },
  address: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Lato'
  },
  status: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
    marginLeft: 16,
    fontFamily: 'Lato'
  },
});