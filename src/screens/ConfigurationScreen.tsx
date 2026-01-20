import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, TextInput, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ColorPicker } from '../components/ColorPicker';
import { useCompany } from '../context/CompanyContext';
import db from '../database/db';
import { defaultColor } from '../../constans/colors';

type ConfigurationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Configuration'>;

interface ConfigurationProps {
    navigation: ConfigurationScreenNavigationProp;
}

export default function ConfigurationScreen({ navigation }: ConfigurationProps) {
    const { company, refreshCompany } = useCompany();
    const [nameCompany, setNameCompany] = useState('');
    const [mainColor, setMainColor] = useState('');
    const [logoUri, setLogoUri] = useState<string | null>(null);

    useEffect(() => {
        if (company) {
            setNameCompany(company.nameCompany || '');
            setMainColor(company.mainColor || '');
            setLogoUri(company.logoUrl || null);
        }
    }, [company]);

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

    const handleSave = async () => {
        if (!nameCompany) {
            Alert.alert('Error', 'Completa el nombre de tu negocio');
            return;
        }
        try {
            if (company?.id) {
                db.runSync(
                    'UPDATE company SET nameCompany = ?, mainColor = ?, logoUrl = ? WHERE id = ?',
                    [nameCompany, mainColor || defaultColor, logoUri || '', company.id]
                );
                refreshCompany();
                Alert.alert('¡Guardado!', 'Los cambios se guardaron correctamente.');
                navigation.goBack();
            }
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'No se pudieron guardar los cambios.');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor={mainColor || defaultColor} />
            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>Configuración de la empresa</Text>
                
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
                    {logoUri ? (
                        <View style={styles.logoContainer}>
                            <Image 
                                source={{ uri: logoUri }} 
                                style={styles.logoPreview} 
                            />
                            <TouchableOpacity 
                                style={styles.changeLogoButton} 
                                onPress={pickImage}
                            >
                                <Text style={styles.changeLogoText}>Cambiar imagen</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={styles.selectImageButton} 
                            onPress={pickImage}
                        >
                            <Text style={styles.selectImageIcon}>🖼️</Text>
                            <Text style={styles.selectImageText}>Seleccionar imagen</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: mainColor || defaultColor }]}
                    onPress={handleSave}
                >
                    <Text style={styles.submitButtonText}>Guardar cambios</Text>
                </TouchableOpacity>
            </ScrollView>
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
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoContainer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignSelf: 'center',
    },
    logoPreview: {
        width: 120,
        height: 120,
        borderRadius: 12,
        marginBottom: 8,
    },
    changeLogoButton: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    changeLogoText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '600',
    },
    selectImageButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
    },
    selectImageIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    selectImageText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '500',
    },
});
