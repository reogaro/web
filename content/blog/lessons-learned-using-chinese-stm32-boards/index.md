+++
title = 'Lessons learned from using chinese STM32 clones'
date = 2023-01-15T09:00:00-07:00
draft = false
tags = ['embedded', 'linux']
categories = ['blog']
image = 'st-link-clone.jpg'
+++

# BluePill Dev Boards

BluePill boards are cheap chinese arduino-esque dev boards based on the STM32. They have many issues such as clone chips or incorrect R10 USB data resistors but are very cheap. [STM32-Base](https://stm32-base.org/boards/STM32F103C8T6-Blue-Pill.html) documents them well.

The BluePill board with top-mounted female headers from Jonah uses a **CKS** ```CKS32F103C8T6``` chip (chinese [datasheet](obsidian://open?vault=mastermind&file=3-ressources%2Ftech%2Fdatenbl%C3%A4tter%2Fbauteile-elektro%2FCKS-CKS32F103C8T6_C556576.pdf)), a clone of the ```STM32F103C8T6```. It has 64 Kbytes of Flash memory.

> A major difference one will quickly encounter with this chip is when programming it and getting the message `"UNEXPECTED idcode: 0x2ba01477"`. The reason for this is that the STM32F103 MCU reports the ID `0x1ba01477`, confusing the programmer. This can be fixed for example in OpenOCD by using a configuration script that specifies either no CPUTAPID (0), or this ID reported by the CS32 MCU.
> \- [Hackaday](https://hackaday.com/2020/10/22/stm32-clones-the-good-the-bad-and-the-ugly/)

```platformio.ini``` line that fixes this error:
```ini
upload_flags = -c set CPUTAPID 0x2ba01477
```

More invasive: modify ```/usr/share/openocd/scripts/target/stm32f1x.cfg```
```
#set _CPUTAPID 0x1ba01477
set _CPUTAPID 0x2ba01477
```

## Black Magic Probe on BluePill

*note: this was tested on the bluepill from jonah with upside-down female headers. 0x08000000 is the start of flash memory on STM32F103x8 chips*

```bash
git checkout v1.10.1
nix-shell
make clean && make PROBE_HOST=stlink BLUEPILL=1
```
Flash using ST-Link:
```bash
openocd -f interface/stlink.cfg -f target/stm32f1x.cfg -c 'program blackmagic.bin verify reset exit 0x08000000'
```
Flash using picoprobe:
```bash
openocd -f interface/cmsis-dap.cfg -f target/stm32f1x.cfg -c 'program blackmagic.bin verify reset exit 0x08000000'
```
Run OpenOCD on a ST-Link and connect via gdb:
```
openocd -f interface/stlink.cfg -f target/stm32f1x.cfg
gdb
target extended-remote localhost:3333
```

# ST-Link

The probably cheapest way to flash STM32 chips are Chinese ST-LINK/V2 clones. They offer a SWD interface, no JTAG. This debugger has a 10-pin IDC connector. The pinout of this connector can be found below.

**!warning for fedora users!** Fedora ```arm-none-eabi-gdb``` was [dropped](https://src.fedoraproject.org/rpms/arm-none-eabi-gdb). Plain ```gdb``` supposedly works [just as well](https://github.com/rust-embedded/book/pull/335).

The blue ST-Links (blue pcb) I own contain a LQFP48 **Geehy** ```APM32F103CBT6```.

Blue Pinout (tested):

| Function | uC Pin |
| -------- | ------ |
| SWDIO    | PB14   |
| SWCLK    | PB6    |
| RST      | PB6    |
| SWIM     | PA9    |

*Further Pinout Infos:* [Black Magic](https://github.com/blackmagic-debug/blackmagic/tree/main/src/platforms/stlink#reverting-to-original-st-firmware-with-running-bmp-firmware), [Phil Pemberton](https://philpem.me.uk/elec/stlink-blackmagic)

The red one (green pcb) uses a *differently labeled* **Geehy** ```APM32F103CBT6```

# Reflashing a clone ST-Link to Black Magic Debug Probe

[Michał Ciesielski](https://ciesie.com/post/black_magic_probe_stlink/) has an excellent blog post tutorial on this topic that was only slightly out-of-date. The following addendum must be considered:
[newer stlink-tool for linux](https://github.com/GabyPCgeeK/stlink-tool)
As of right now, the blackmagic firmware doesn't build on some systems. Nix can fix this problem:
```bash
git clone --recursive https://github.com/blackmagic-debug/blackmagic.git
cd blackmagic
git checkout v1.10.1
nix-shell
make PROBE_HOST=stlink
```
```STLINK_FORCE_CLONE=1``` force-fixes the RST pin pinout to PB6 as on the blue ones
```SWIM_AS_UART=1``` is an aditional option, but not well-documented. [this](https://philpem.me.uk/elec/stlink-blackmagic) seems to have info on the topic.
```BLUEPILL=1``` to use a bluepill dev board instead of a ST-Link
```ST_BOOTLOADER=1``` to not use the blackmagic bootloader
