import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, TextInput, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ColorPicker } from '../components/ColorPicker';
import { insertCompany } from '../database/company';
import { defaultColor } from '../../constans/colors';
import { useCompany } from '../context/CompanyContext';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

interface RegisterProps {
    navigation: RegisterScreenNavigationProp;
}

export default function RegisterScreen({ navigation }: RegisterProps) {
    const { refreshCompany } = useCompany();
    const [nameCompany, setNameCompany] = useState('');
    const [mainColor, setMainColor] = useState('');
    const [logoUri, setLogoUri] = useState<string | null>(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setLogoUri(result.assets[0].uri);
        }
    };

    const handleRegister = async () => {
        if (!nameCompany) {
            Alert.alert('Completa el nombre de tu negocio');
            return;
        }
        try {
            console.log('=== INICIO DE REGISTRO ===');
            console.log('logoUri state:', logoUri);
            console.log('nameCompany:', nameCompany);
            console.log('mainColor:', mainColor);
            
            let logoPath = '';
            if (logoUri) {
                logoPath = logoUri;
                console.log('✅ Logo URI asignado:', logoPath);
            } else {
                console.log('❌ NO hay logoUri - el usuario no seleccionó imagen');
            }
            
            console.log('Datos a insertar:', {
                nameCompany,
                mainColor: mainColor || defaultColor,
                logoUrl: logoPath
            });
            
            insertCompany({
                nameCompany,
                mainColor: mainColor || defaultColor,
                logoUrl: logoPath
            });
            
            refreshCompany();
            Alert.alert('¡Registrado!', 'La peluquería fue registrada correctamente.');
            navigation.navigate('Home')        
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'No se pudo registrar la peluquería.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={'#ffffff'} />
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Registrá tú peluquería</Text>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                        style={styles.input}
                        value={nameCompany}
                        onChangeText={setNameCompany}
                        placeholder="Ingresa el nombre de tu peluquería"
                        placeholderTextColor="#9ca3af"
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Color principal</Text>
                    <ColorPicker value={mainColor} onChange={setMainColor} />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Logo</Text>
                    <TouchableOpacity style={[styles.input, { justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }]} onPress={pickImage}>
                        <Text style={{ color: '#9ca3af' }}>{logoUri ? 'Cambiar imagen' : 'Seleccionar imagen'}</Text>
                    </TouchableOpacity>
                    {logoUri && (
                        <Image source={{ uri: logoUri }} style={{ width: 80, height: 80, borderRadius: 8, marginTop: 8 }} />
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: mainColor || defaultColor }]}
                    onPress={handleRegister}
                >
                    <Text style={styles.submitButtonText}>Registrar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
    },
    	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		color: 'black',
		marginBottom: 8,
	},
	input: {
		backgroundColor: '#fff',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
    submitButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#f9a8d4',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButtonText: {
        color: 'black',
        fontSize: 16,
    },
});
