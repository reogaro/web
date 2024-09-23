+++
title = 'DC Motorman'
date = 2023-03-15T11:00:00-07:00
draft = false
tags = ['machine','electronics','pico']
summary = '20W 2-channel DC Servo Driver'
categories = ['project']
image = 'pcb-only.jpg'
transparentimg  = 'motor.png'
+++

# DC Motorman

The "DC Servoman" is my nickname for a Pico DC Servo Controller circuit board, designed to control two DC motors with quadrature encoders via UART communication.

{{< model-viewer src="pcb.glb" poster="pcb.png" alt="A 3D scan of a ST-Link/V2 clone" ar="false" auto-rotate="true" camera-controls="true" disable-zoom="true" rotation-per-second="300%" interaction-prompt="none">}}

## Backstory

A while ago, some friends and I disassembled a big laboratory machine for parts. It contained a handful of motors from [Maxon](https://www.maxongroup.com/en), high quality swiss made brushed DC motors with optical encoders on the back.

The motors have variations of the `44.022.0XX` part no., such as `44.022.000-00.19-335`. They contain Agilent-branded optical quadrature encoders (`09880 0036`).

They all have the same Berg (Now Amphenol) [65239-004LF](https://www.digikey.com/en/products/detail/amphenol-cs-fci/65239-004LF/1001561) 8-pin blue plug.

![](connector.png)

As these high quality components where just begging to be put to use, I designed a circuit board to easily drive them.

## Specifications

- Microcontroller: Raspberry Pi Pico
- Motor Driver ICs: TB67H451FNG motor drivers
- Power Regulation: 7805 voltage regulator
- DC Motors: Feedback via quadrature encoders
- Power Input: A 5V DC input via a DC jack (DC1)
- Communication: UART over Raspberry Pi Pico's GPIO pins or USB

## Circuit Design

The schematic of the project is divided into the following key areas:

Power Supply: The system operates with a regulated 5V supply using a 7805 voltage regulator with capacitors for voltage smoothing

Motor Driver: TB67H451FNG motor drivers control the two motors. There are two drivers for two motors.

![](dc-servoman-schematic.svg)

## Batch 1 PCBs

Batch 1 of the boards are designed and ordered.

![](pcb-only.jpg)

There where errors in design revision 1: 

- The encoders I used couldn't even drive the miniscule currents needed for the voltage divider
- The barrel jack polarity was opposite of conventions (VCC out, GND in).
- The motor connector was the wrong way around
- The trim pots wheren't labeled

For revision 2, these errors should be rectified.

## Batch 2 PCBs

These are currently being designed on [EasyEDA](https://easyeda.com/editor#id=20fa881ac148443ea179047cb91ba48c|e99d97a880694a499c315b93f96a5592). They should fix the above mentioned issues.

## Software

The software running on the Raspberry Pi Pico is responsible for motor control, encoder pulse counting, and communication. The key components are:

**UART Communication:** The motors can be controlled either through the Pico’s GPIO pins configured for UART or through the USB interface. You can send a target step count to reach.

**Flexible Encoder Pulse Counting:** The quadrature encoder signals are processed either by the Pico’s Programmable Input/Output (PIO) subsystem or classic interrupts. The PIO efficiently counts the pulses from the encoders without consuming CPU cycles, allowing for precise tracking of motor positions. This is essential for maintaining accurate control of motor movement. There is also a interrupt version available.

**Position Control via PID:** The motor positions are controlled using a Proportional-Integral-Derivative (PID) controller for position control. The PID control loop ensures that the motors reach the desired positions with minimal error. The PID constants (proportional, integral, and derivative gains) have been tuned using the Ziegler-Nichols method to ensure optimal response and stability in the system.

**Motor Control via PWM:** Pulse-width modulation (PWM) is used to control the speed of the motors.

## Conclusion

![](with-stuff.jpg)

The Pico DC Servo Controller is a great learning experience for designing a circuit board. It successfully controls two DC motors with feedback from quadrature encoders. With further software improvements, this will be used in future software projects.

