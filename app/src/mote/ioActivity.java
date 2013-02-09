package mote;

import com.moteio.remote.R;

import android.os.Bundle;
import com.phonegap.*;

public class ioActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
        this.appView.addJavascriptInterface(this, "android"); 
        this.appView.setInitialScale(0); 
    }
}