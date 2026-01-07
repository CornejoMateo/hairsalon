import { View, Pressable, StyleSheet} from 'react-native';
import { colors } from '../../constans/colors';
import React from 'react';

type ColorPickerProps = {
    value?: string;
    onChange: (color: string) => void;
}

export function ColorPicker({value, onChange}: ColorPickerProps) {
    return (
        <View style={styles.container}>
            {colors.map((color: any) => {
                const selected = value === color;
                return (
                    <Pressable
                        key={color}
                        onPress={() => onChange(color)}
                        style={[styles.colors, { backgroundColor: color, borderWidth: selected ? 3 : 0 }]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flexDirection: 'row',
        flexWrap: 'wrap', 
        gap: 12 
    },
    colors: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderColor: '#000'
    }
});