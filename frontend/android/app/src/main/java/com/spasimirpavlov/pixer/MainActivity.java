package com.spasimirpavlov.pixer;

import android.os.Bundle;

import com.epicshaggy.biometric.NativeBiometric;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(NativeBiometric.class);
    }
}
