import { Image, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Voice from '@react-native-voice/voice';
import firestore from '@react-native-firebase/firestore';

const SpeechScreen = () => {
  const [started, setStarted] = useState('');
  const [ended, setEnded] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.removeAllListeners();
    };
  }, []);

  const onSpeechStart = () => {
    console.log('Speech started');
    setStarted('Started');
  };

  const onSpeechEnd = () => {
    console.log('Speech ended');
    setEnded('Ended');
  };

  const onSpeechResults = (e) => {
    console.log('Speech results:', e.value);
    if (e.value && e.value.length > 0) {
      const preciseResult = e.value[0];
      setResult(preciseResult);
    }
  };

  const startRecognizing = async () => {
    try {
      console.log('Started recognition');
      await Voice.start('en-US');
      setStarted('');
      setEnded('');
      setResult('');
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  };

  const stopRecognizing = async () => {
    try {
      console.log('Stopped recognition');
      await Voice.stop();
      setStarted('');
      setEnded('');
      setResult('');
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  };

  const pushToFirestore = async (text) => {
    try {
      const timestamp = new Date().toISOString();
      await firestore().collection('extractedtext').doc(timestamp).set({
        text: text,
        timestamp: timestamp,
      });
      console.log('Text pushed to Firestore successfully');
      ToastAndroid.show('Text pushed to Firestore successfully', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error pushing text to Firestore:', error);
      ToastAndroid.show('Error pushing text to Firestore', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speech To Text</Text>
      <TouchableOpacity onPress={startRecognizing} style={styles.button}>
        <Image source={require('../Assets/mic.png')} style={{ width: 150, height: 150}} />
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>{started}</Text>
        <Text style={styles.infoText}>{ended}</Text>
      </View>

      <ScrollView style={{width: "100%"}}>
        <View style={{padding: 20}}>
          <Text style={styles.infoText}>Results: </Text>
          <Text style={styles.infoText}>{result}</Text>
        </View>
        {result ? (
          <TouchableOpacity onPress={() => pushToFirestore(result)} style={styles.pushButton}>
            <Text style={styles.buttonText}>Push To Database</Text>
          </TouchableOpacity>
        ) : (
          <Text></Text>
        )}
      </ScrollView>

      <TouchableOpacity onPress={stopRecognizing} style={styles.stopButton}>
        <Text style={styles.buttonText}>CLEAR SCREEN</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 25,
    color: 'black',
    marginTop: 25,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    padding: 10,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  infoText: {
    fontSize: 18,
    color: 'black',
  },
  stopButton: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    position: 'absolute',
    bottom: 0,
  },
  pushButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'black',
    borderRadius: 5,
    alignSelf: 'center',
  },
});

export default SpeechScreen;
