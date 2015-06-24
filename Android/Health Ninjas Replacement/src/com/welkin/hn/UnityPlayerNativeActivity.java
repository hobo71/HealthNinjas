package com.welkin.hn;

import com.unity3d.player.*; 

import android.annotation.SuppressLint;
import android.app.NativeActivity;
import android.content.res.Configuration;
import android.graphics.PixelFormat;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

// Need these for BioHarness interactions
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import android.bluetooth.*;
import android.util.Log;
import zephyr.android.BioHarnessBT.*;
import java.util.Set;
import android.os.Handler;
import android.os.Message;
// -----------------------------------------

public class UnityPlayerNativeActivity extends NativeActivity {
	// BioHarness Integration ---------------------------------------------
	private BluetoothAdapter adapter = null;
	private BTClient _bt;
	//	private ZephyrProtocol _protocol;
	private NewConnectedListener _NConnListener;
	private final int HEART_RATE = 0x100;
	private final int RESPIRATION_RATE = 0x101;
	private final int SKIN_TEMPERATURE = 0x102;
	private final int POSTURE = 0x103;
	private final int PEAK_ACCLERATION = 0x104;	
	// --------------------------------------------------------------------
	
	protected UnityPlayer mUnityPlayer;		// don't change the name of this variable; referenced from native code

	// UnityPlayer.init() should be called before attaching the view to a layout - it will load the native code.
	// UnityPlayer.quit() should be the last thing called - it will unload the native code.
	protected void onCreate (Bundle savedInstanceState) {
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		super.onCreate(savedInstanceState);
		
		getWindow().takeSurface(null);
		setTheme(android.R.style.Theme_NoTitleBar_Fullscreen);
		getWindow().setFormat(PixelFormat.RGB_565);

		mUnityPlayer = new UnityPlayer(this);
		if (mUnityPlayer.getSettings ().getBoolean ("hide_status_bar", true))
			getWindow ().setFlags (WindowManager.LayoutParams.FLAG_FULLSCREEN,
			                       WindowManager.LayoutParams.FLAG_FULLSCREEN);

		int glesMode = mUnityPlayer.getSettings().getInt("gles_mode", 1);
		boolean trueColor8888 = false;
		mUnityPlayer.init(glesMode, trueColor8888);

		View playerView = mUnityPlayer.getView();
		setContentView(playerView);
		playerView.requestFocus();
		
//		// Hide both the navigation bar and the status bar.
//		View decorView = getWindow().getDecorView();
//		decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE
//	            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
//	            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
//	            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION // hide nav bar
//	            | View.SYSTEM_UI_FLAG_FULLSCREEN // hide status bar
//	            );
		
		// BioHarness Integration ---------------------------------------------
		IntentFilter filter = new IntentFilter("android.bluetooth.device.action.PAIRING_REQUEST");
        /*Registering a new BTBroadcast receiver from the Main Activity context with pairing request event*/
		this.getApplicationContext().registerReceiver(new BTBroadcastReceiver(), filter);
        // Registering the BTBondReceiver in the application that the status of the receiver has changed to Paired
        IntentFilter filter2 = new IntentFilter("android.bluetooth.device.action.BOND_STATE_CHANGED");
        this.getApplicationContext().registerReceiver(new BTBondReceiver(), filter2);
	}
	
	protected void onDestroy () {
		if (_bt != null) {
			disconnect();
		}
		mUnityPlayer.quit();
		super.onDestroy();
	}

	// onPause()/onResume() must be sent to UnityPlayer to enable pause and resource recreation on resume.
	protected void onPause() {
		super.onPause();
		mUnityPlayer.pause();
	}
	
	protected void onResume() {
		super.onResume();
		mUnityPlayer.resume();
	}
	
	public void onConfigurationChanged(Configuration newConfig) {
		super.onConfigurationChanged(newConfig);
		mUnityPlayer.configurationChanged(newConfig);
	}
	
	public void onWindowFocusChanged(boolean hasFocus) {
		super.onWindowFocusChanged(hasFocus);
		mUnityPlayer.windowFocusChanged(hasFocus);
	}
	
	public boolean dispatchKeyEvent(KeyEvent event) {
		if (event.getAction() == KeyEvent.ACTION_MULTIPLE)
			return mUnityPlayer.onKeyMultiple(event.getKeyCode(), event.getRepeatCount(), event);
		return super.dispatchKeyEvent(event);
	}
	
	// BioHarness Integration ---------------------------------------------
	private void setLog(String strMsg) {
		UnityPlayer.UnitySendMessage("BioHarness", "SetLog", strMsg);
	}
	
	public void connect() {
		String BhMacID = "00:07:80:9D:8A:E8";
		adapter = BluetoothAdapter.getDefaultAdapter();
		
		Set<BluetoothDevice> pairedDevices = adapter.getBondedDevices();
		
		if (pairedDevices.size() > 0) {
			for (BluetoothDevice device : pairedDevices) {
				if (device.getName().startsWith("BH")) {
					BluetoothDevice btDevice = device;
					BhMacID = btDevice.getAddress();
					break;
				}
			}
		}
		
		BluetoothDevice Device = adapter.getRemoteDevice(BhMacID);
		String DeviceName = Device.getName();
		_bt = new BTClient(adapter, BhMacID);
		_NConnListener = new NewConnectedListener(Newhandler,Newhandler);
		_bt.addConnectedEventListener(_NConnListener);
	
		if(_bt.IsConnected()) {
			_bt.start();
			setLog(DeviceName);
		} else {
			setLog("Fail");
		}
	}
	
	public void disconnect() {
		_bt.removeConnectedEventListener(_NConnListener);
		_bt.Close();
	}
	
	private class BTBondReceiver extends BroadcastReceiver {
		@Override
		public void onReceive(Context context, Intent intent) {
			Bundle b = intent.getExtras();
			BluetoothDevice device = adapter.getRemoteDevice(b.get("android.bluetooth.device.extra.DEVICE").toString());
			Log.d("Bond state", "BOND_STATED = " + device.getBondState());
		}
    }
	
    private class BTBroadcastReceiver extends BroadcastReceiver {
		@Override
		public void onReceive(Context context, Intent intent) {
			Log.d("BTIntent", intent.getAction());
			Bundle b = intent.getExtras();
			Log.d("BTIntent", b.get("android.bluetooth.device.extra.DEVICE").toString());
			Log.d("BTIntent", b.get("android.bluetooth.device.extra.PAIRING_VARIANT").toString());
			try {
				BluetoothDevice device = adapter.getRemoteDevice(b.get("android.bluetooth.device.extra.DEVICE").toString());
				Method m = BluetoothDevice.class.getMethod("convertPinToBytes", new Class[] {String.class} );
				byte[] pin = (byte[])m.invoke(device, "1234");
				m = device.getClass().getMethod("setPin", new Class [] {pin.getClass()});
				Object result = m.invoke(device, pin);
				Log.d("BTTest", result.toString());
			} catch (SecurityException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			} catch (NoSuchMethodException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			} catch (IllegalArgumentException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IllegalAccessException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (InvocationTargetException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
    }
    
    @SuppressLint("HandlerLeak")
	final Handler Newhandler = new Handler() {
    	public void handleMessage(Message msg) {
			if (msg.getData() == null) {
				return;
			}
    		switch (msg.what) {
				case RESPIRATION_RATE:
					if(msg.getData().getString("RespirationRate") != null)
						UnityPlayer.UnitySendMessage("BioHarness", "SetRepirationRate", msg.getData().getString("RespirationRate"));
					break;
		   		case HEART_RATE:
    				if(msg.getData().getString("HeartRate") != null)
    					UnityPlayer.UnitySendMessage("BioHarness", "SetHeartRate", msg.getData().getString("HeartRate"));
		   			break;
    			/*
		   		case SKIN_TEMPERATURE:
    				if(msg.getData().getString("SkinTemperature") != null)
    					UnityPlayer.UnitySendMessage("BioHarness", "SetSkinTemperature", msg.getData().getString("SkinTemperature"));
    				break;
		   		case POSTURE:
		   			if(msg.getData().getString("Posture") != null)
		   				UnityPlayer.UnitySendMessage("BioHarness", "SetPosture", msg.getData().getString("Posture"));
		   			break;
		   		case PEAK_ACCLERATION:
		   			if(msg.getData().getString("PeakAcceleration") != null)
		   				UnityPlayer.UnitySendMessage("BioHarness", "SetPeakAcceleration",msg.getData().getString("PeakAcceleration"));
		   			break;	
		   		*/
		   		default:
		   			break;
    		}
    	}
    };
	// --------------------------------------------------------------------
}