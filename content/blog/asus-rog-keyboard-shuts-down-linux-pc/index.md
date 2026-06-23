+++
title = 'How To Stop an ASUS ROG Keyboard from Randomly Shutting Down Your Linux PC'
date = 2026-06-23T13:18:40+02:00
draft = false
tags = ['hardware', 'linux']
categories = ['blog']
image = 'keeb-big-1280.jpg'
transparentimg = 'keeb-small.png'
summary = 'Hateposting from a now-fixed 150€+ "deluxe" keyboard'
+++


# How To Stop an ASUS ROG Keyboard from Randomly Shutting Down Your Linux PC

If you are also using an ASUS ROG wireless keyboard on Linux (Strix Scope NX Wireless, Falchion, etc...), you have likely experienced that the keyboard, when left idle, powers off your PC.

Here's how to fix it:

---

## The Fix

Create a new udev rule file. **The filename must start with a number smaller than `70`** so it runs before the default systemd rules tag the device. We'll use `69`.

```bash
sudo nano /etc/udev/rules.d/69-asus-rog-no-power-events.rules
```

Paste the following (**For the Strix Scope NX Wireless**):

```udev
# Prevent ASUS ROG Wireless keyboards from sending phantom power/sleep events.
# Matches the "System Control" interface and removes its key input tags.
# Adjust the USB Product ID to match your device.

ACTION=="remove", GOTO="rog_keyboard_end"

SUBSYSTEM=="input", \
  KERNEL=="event*", \
  ATTRS{id/vendor}=="0b05", \
  ATTRS{id/product}=="19f8", \
  ATTRS{name}=="*System Control*", \
  ENV{ID_INPUT_KEY}="", \
  ENV{ID_INPUT}="", \
  ENV{LIBINPUT_IGNORE_DEVICE}="1"

LABEL="rog_keyboard_end"
```

Save the file, then reload udev rules:

```bash
sudo udevadm control --reload-rules
```

**Replug the dongle. It should be fixed.**

*(`systemd-logind` only re-evaluates devices on a clean USB plug event, not a rule reload. You can also just reboot to be 100% sure.)*

### Verify

```bash
journalctl -u systemd-logind -n 20 --no-pager | grep "Watching system buttons"
```

If the output contains `System Control`, something went wrong. Try again.

---

## Other ASUS ROG Keyboards

The rule above targets the ROG Strix Scope NX Wireless (`idProduct=19f8`). For other models, plug in your keyboard's wireless dongle, then run:

```bash
lsusb | grep -i "asus\|0b05"
```

Look for a line like:
`Bus 001 Device 005: ID 0b05:19f8 ASUSTek Computer, Inc. ROG STRIX SCOPE NX WIRELESS DELUXE`

* **Vendor ID:** For ASUS, this is almost always `0b05`. *[USB Vendor ID Table](http://www.linux-usb.org/usb.ids) for those who are interested*
* **Product ID:** This varies by keyboard model. Replace `19f8` in the rule with yours.

The `ATTRS{name}=="*System Control*"` line should match any ASUS ROG keyboard, so only the Product ID line should need changing.

---

## Why Does This Happen?

To save battery, wireless ASUS ROG keyboards put their wireless radio to sleep after a period of inactivity. When they do this, the firmware sends a phantom `KEY_SLEEP` or `KEY_POWER` event to the operating system over USB.

If you run `cat /proc/bus/input/devices`, you'll notice the keyboard actually exposes multiple input interfaces. One of them is our special **"System Control"** device:

```text
N: Name="ASUSTeK ROG STRIX SCOPE NX WIRELESS DELUXE System Control"
H: Handlers=kbd event19 
...
```

This is presumably a hacky way for the keyboard to communicate with ASUS [Armoury Crate](https://rog.asus.com/de/content/armoury-crate/), their massive proprietary piece of Windows bloatware. Instead of writing a custom USB driver, they create a secondary `DELUXE System Control` HID device to communicate with Armoury Crate.

This `System Control` subdevice broadcasts a system-wide `SLEEP` event to the OS. On Windows, Armoury Crate intercepts the event. On Linux, `systemd-logind` takes it literally.

When `systemd-logind` sees a device with power and sleep capabilities, it tags it as a `power-switch`. When the keyboard goes idle, it fires the sleep keycode. `systemd-logind` receives it, assumes you pressed a physical sleep button, and suspends or powers off your machine.

A 150€ ROG STRIX SCOPE NX WIRELESS DELUXE does this. A no-name 5€ AliExpress board manages without.

## Why This Fix, and Not the Other One?

You might have also seen [workarounds online](https://gist.github.com/jnettlet/afb20a048b8720f3b4eb8506d8b05643) suggesting you modify your `hwdb` (Hardware Database) to remap the specific raw hex scancodes to "reserved". This is brittle: if ASUS ever updates the firmware scancode, it breaks silently. That gist is from 2021, by the way.

This `udev` rule is cleaner: instead of remapping individual scancodes, it strips the entire "System Control" interface of its power-switch privileges. It targets only the `*System Control*` sub-device, leaving normal typing and media keys completely unaffected.

---

ASUS engineers: the fix is 9 lines of udev. Available for consulting at standard rates. The keyboard works great on Windows.

