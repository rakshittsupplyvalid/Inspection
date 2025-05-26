// src/utils/storage.ts
import { MMKVLoader } from 'react-native-mmkv-storage';

const Storage = new MMKVLoader().initialize();

export default Storage;
