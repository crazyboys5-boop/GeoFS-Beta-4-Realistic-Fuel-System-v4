# GeoFS-Beta-4-Realistic-Fuel-System-v4
A realistic fuel system for GeoFS Beta 4 featuring aircraft-specific fuel capacities, estimated fuel consumption, airport-based refueling, low-fuel warnings, and automatic fuel reset when switching aircraft. Supports a large aircraft profile database and dynamically loads North American airports.

GeoFS Realistic Fuel System — Beta 4

A Tampermonkey userscript that adds an aircraft fuel-management system to GeoFS. It is designed to make flights more realistic by assigning aircraft-specific fuel capacities and consumption estimates, requiring pilots to land at airports to refuel, and reducing throttle when fuel is exhausted.

The system adds a movable fuel-management panel directly to the GeoFS interface.

Features

Aircraft-specific fuel profiles: Contains estimated fuel capacities and fuel-burn rates for a wide range of airliners, general aviation aircraft, military aircraft, helicopters, gliders, and other aircraft.

Live fuel tracking: Estimates fuel consumption based on elapsed time and throttle position.

Fuel exhaustion: When the estimated fuel supply reaches zero, the script attempts to reduce the throttle to zero.

Airport-based refueling: Refueling is available when the aircraft is detected on the ground within approximately 1,400 metres of a listed airport.

Automatic fuel reset: Switching to a different detected aircraft resets its fuel supply to that aircraft profile's estimated full capacity.

Low-fuel warnings: Displays low-fuel and critical-fuel warnings.

Estimated endurance: Calculates approximate remaining flight time from the current fuel quantity and estimated burn rate.

North American airport database: Downloads an airport database containing facilities in the United States, Canada, and Mexico, including smaller airports and other recorded aerodromes.

Nearest-airport display: Shows the nearest listed airport and the approximate distance to it.

Movable interface: Drag the panel to reposition it on the screen.

Collapsible panel: Minimize the panel when more screen space is needed.

Unknown-aircraft fallback: Uses a generic fuel profile when no aircraft-specific profile matches.

Requirements

A desktop browser compatible with GeoFS.

Access to GeoFS.

Tampermonkey or a compatible userscript manager.

An internet connection to download the North American airport database.

Installation

Step 1 — Install Tampermonkey

Install Tampermonkey from your browser's supported extension store.

Step 2 — Create the userscript

Open the Tampermonkey dashboard.

Select Create a new script.

Delete the example script provided by the editor.

Open the .user.js file in this repository.

Copy the entire file into the Tampermonkey editor.

Save the script.

Step 3 — Open GeoFS

Open GeoFS using one of the supported addresses:

https://www.geo-fs.com/geofs.php

https://beta.geo-fs.com/geofs.php

https://geo-fs.com/geofs.php

Make sure the userscript is enabled, then reload the GeoFS page.

Step 4 — Check the fuel panel

The panel should appear near the upper-right corner of the screen.

When an aircraft is detected, the panel is designed to display:

Aircraft profile

Current estimated fuel

Estimated tank capacity

Estimated fuel-burn rate

Throttle percentage

Estimated time remaining

Ground status

Nearest listed airport

Current fuel-system status

If the panel remains on Waiting for GeoFS or displays unavailable information, the script may not be compatible with the current GeoFS interface or aircraft data structure.

How to use the fuel system

1. Start a flight

Load an aircraft in GeoFS. The script attempts to identify the aircraft and assign its corresponding fuel profile.

The aircraft should start with the full estimated capacity for that profile.

2. Fly normally

Fuel consumption is estimated from the selected aircraft's configured burn rate and the current throttle value.

Higher throttle settings consume more fuel in this model. Actual aircraft fuel consumption also depends on factors such as engine type, altitude, airspeed, aircraft weight, and flight conditions. Those variables are not fully modeled by this script.

3. Monitor your fuel

Watch the fuel percentage and estimated endurance in the panel.

The intended warnings are:

Low fuel: 25% or less.

Critical fuel: 10% or less.

Out of fuel: The estimated fuel quantity has reached zero.

These are simulator-side estimates, not actual GeoFS aircraft fuel measurements.

4. Refuel at an airport

Fly to a listed airport.

Land and bring the aircraft onto the ground.

Move within approximately 1,400 metres of the airport's stored coordinates.

Wait for the script to detect the aircraft's ground status and airport proximity.

Select REFUEL AIRCRAFT.

If the conditions are satisfied, the script sets the estimated fuel quantity to the selected aircraft profile's full capacity.

The script checks proximity to an airport's coordinates. It does not currently verify that the aircraft is on a runway, at a fuel pump, parked at a gate, or connected to an actual airport fuel service.

5. Switch aircraft

When the script detects a change in aircraft identity, it selects a new profile and resets the estimated fuel to full capacity.

This is intentional behavior for the current version. Fuel is not currently saved independently for each aircraft, and switching aircraft can therefore be used to restore fuel.

Aircraft profiles

The script includes profiles for aircraft categories such as:

Airbus A320, A330, A350, and A380 families.

Boeing 737, 747, 757, 767, 777, and 787 families.

Regional aircraft such as the CRJ and Embraer E-Jets.

General aviation aircraft such as the Cessna 152 and 172.

Business jets and turboprops.

Military aircraft such as the F-16, F/A-18, F-22, and A-10.

Helicopters, gliders, and other aircraft.

The profile database uses estimated tank capacities in litres and estimated fuel consumption in litres per minute at full throttle.

Important: These figures are configurable estimates. They have not all been validated against aircraft flight manuals or measured GeoFS performance. An aircraft can also receive an incorrect profile if its name or identifier matches an earlier keyword in the profile list.

Unknown aircraft use the generic profile:

Capacity: 250 litres.

Full-throttle burn rate: 2.5 litres per minute.

Airport database

The script starts with a built-in list of airports in North America and selected international locations. It then attempts to download the OurAirports CSV dataset and add facilities in the United States, Canada, and Mexico.

This is intended to include small airports as well as larger commercial airports.

Airport matching depends on the downloaded dataset, its available identifiers and coordinates, and the built-in airport list. The script does not guarantee that every real-world airport is included or that every facility is usable for refueling.

If the airport download fails, the built-in airport list remains available.

Configuration

The script contains settings for:

Update interval: 500 milliseconds.

Airport proximity: 1,400 metres.

Ground-altitude tolerance: 12 metres.

Aircraft capacity and burn rates: Configurable in the aircraft profile database.

Generic profile: 250 litres with a 2.5-litre-per-minute estimated burn rate.

Changing these settings affects the simulation behavior. Test modifications in a normal GeoFS session before relying on them.

Compatibility and limitations

This is an experimental userscript that interacts with GeoFS internal JavaScript objects.

The following limitations are important:

Fuel is simulated by this userscript. It does not establish that GeoFS itself has a native fuel system or that the fuel quantity is synchronized with GeoFS multiplayer.

Aircraft identification may fail. GeoFS can change its internal aircraft data structures, and aircraft names may not match the profile keywords.

Fuel consumption is approximate. It does not model a complete engine, flight-envelope, or aircraft-performance simulation.

Ground detection may fail. The script relies on GeoFS API functions or aircraft ground-contact flags that may differ between versions.

Throttle control may fail. Setting an internal throttle value to zero does not guarantee that every aircraft's engine or control system will respond as intended.

Aircraft switching resets fuel. Individual aircraft fuel states are not stored separately.

Airport proximity is not runway detection. Being near an airport coordinate does not mean the aircraft is at a valid refueling location.

The airport download requires internet access. A network failure or change to the data source may prevent dynamic airport loading.

Profile matching can be ambiguous. Broad keywords can match an unintended aircraft.

The userscript has not been verified on every GeoFS aircraft or supported page.

Testing status

This repository documents intended functionality, not a guarantee of verified operation.

Feature

Status

Fuel-management panel

Implemented in the source; browser testing required

Aircraft profile selection

Implemented; all aircraft matches unverified

Estimated fuel consumption

Implemented; accuracy unverified

Low-fuel warnings

Implemented; runtime testing required

Airport proximity calculations

Implemented; dataset and runtime testing required

Dynamic North American airport loading

Implemented; network testing required

Airport-only refueling

Implemented; GeoFS ground detection must be tested

Throttle cut at zero fuel

Implemented; aircraft compatibility unverified

Aircraft-switch fuel reset

Implemented; aircraft detection must be tested

Multiplayer fuel synchronization

Not implemented

Persistent fuel storage per aircraft

Not implemented

Troubleshooting

The panel does not appear.

Check that Tampermonkey is enabled, the script is saved, and the current GeoFS page matches one of the script's URL patterns. Reload the page and inspect the browser console for errors.

The aircraft name or capacity is wrong.

The script may have matched the wrong keyword or failed to identify the aircraft correctly. Review the aircraft profile list and the aircraft's actual name or identifier.

The refuel button remains disabled.

The script must detect both ground contact and proximity to a listed airport. If either detection fails, refueling will remain unavailable.

The airport database does not load.

Check the browser console and internet connection. The built-in airport list should still be present, but it may not include every desired airport.

The aircraft continues operating after fuel reaches zero.

The script attempts to set the throttle to zero, but its ability to control the aircraft depends on GeoFS internals. Fuel exhaustion is not guaranteed to stop every aircraft.

Safety and scope

This project is intended for use in the GeoFS flight simulator. It does not control real aircraft, connect to real aircraft fuel systems, or provide real-world flight-planning fuel calculations.

Do not use its estimated fuel figures for real aviation decisions.

Contributing

Contributions are welcome. Useful improvements include:

Testing aircraft identification across GeoFS aircraft.

Validating profile values against reliable aircraft specifications.

Improving aircraft-specific fuel-consumption models.

Improving airport and ground detection.

Adding tests for fuel calculations and profile matching.

Improving compatibility with future GeoFS updates.

When submitting a change, describe the aircraft and GeoFS version tested, the expected behavior, the observed behavior, and any known limitations.
