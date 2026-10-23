package com.bijoy.archerai;

import android.content.Intent;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "PhoneControl")
public class PhoneControlPlugin extends Plugin {

    @PluginMethod
    public void openApp(PluginCall call) {
        String app = call.getString("app", "").toLowerCase();
        String pkg;

        switch (app) {
            case "youtube":
                pkg = "com.google.android.youtube";
                break;
            case "chrome":
                pkg = "com.android.chrome";
                break;
            case "facebook":
                pkg = "com.facebook.katana";
                break;
            case "whatsapp":
                pkg = "com.whatsapp";
                break;
            default:
                call.reject("এই অ্যাপের কমান্ড এখনো যোগ করা হয়নি");
                return;
        }

        try {
            Intent intent = getContext()
                .getPackageManager()
                .getLaunchIntentForPackage(pkg);

            if (intent == null) {
                call.reject("অ্যাপটি ফোনে ইনস্টল নেই");
                return;
            }

            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);

            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);

        } catch (Exception e) {
            call.reject("অ্যাপ খোলা যায়নি: " + e.getMessage());
        }
    }
}
