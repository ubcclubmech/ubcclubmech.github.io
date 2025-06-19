# Club MECH Website Documentation

The aim of this document is to aid in mainting the content of the UBC Club MECH website, and providing explanations of how it functions. It should be kept current as the website is updated.

## Table of contents

- [Updating website information](#updating-website-information)
  - [Basic information](#basic-information)
    - [Events](#events)
    - [Council and positions](#council-and-positions)
  - [Photos](#photos)
  - [Other content](#other-content)
- [Maintaining the GitHub organisation](#maintaining-the-github-organisation)

## Updating website information

### Basic information

Most changes to the information regarding events, council, and positions can be made without pushing commits to the repository, via the [Club MECH Website Info Google Sheet](https://docs.google.com/spreadsheets/d/15aAzBnPpvBR3ntpgvbLN9WE5ftH6mSTPElIBsFxefk0/edit?pli=1&gid=405302037#gid=405302037). This includes the following:
- event dates, names, start and end times, RSVP and Google Calendar links
- names of council members, and the positions they hold (including entirely new members and entirely new councils)
- the master list of positions, their contact information, their responsibilities, and their current availability.

Any changes made to the Sheet will be seen immediately reflected on the website upon refresh.

#### Events

Events are only displayed on the website if they have a date in the Sheet. If you wish to finalise event information before the event appears on the website, you may therefore leave the date blank to prevent it from showing up.

If 'Start time' is left blank, the time on the website will display as 'TBD'. If 'Start time' is filled, but 'End time' is left blank, only the start time will be displayed. If both 'Start time' and 'End time' are filled, the full time range will appear.

If 'Location' is left blank, the location on the website will display as 'TBD'.

The 'RSVP' and 'Add to Google Calendar' buttons will only appear when assigned a value in the Sheet.

#### Council and positions

When adding new council members (or even a new council entirely), you can simply add entries to the 'Council' tab in the Sheet. The website will automatically detect the most recent year, and display that as the current council. Email addresses associated with positions are only shown for the most recent council.

Council members are displayed in order of their position 'rank', which is designated by their ordering on the 'Positions' tab of the Sheet. If members hold more than one position, they are placed according to their _first_ assigned position.

The list of positions that council members can be assigned is designated by the list in the 'Positions' tab. If you wish to assign a council member a brand new position, you should first add an entry to the 'Positions' tab.

### Photos

If you wish to add images for either events or council members, you will need to first push those images to the repository, then make sure 'Photo/Image' column is ticked on the 'Events' or 'Council' tab in the [Google Sheet](https://docs.google.com/spreadsheets/d/15aAzBnPpvBR3ntpgvbLN9WE5ftH6mSTPElIBsFxefk0/edit?pli=1&gid=405302037#gid=405302037).

When organising photos, the file structures are as follows:
- events: `/media/events/{year}/{month #}/{day} {Event Name}.jpg`
- council: `/media/council/{year}/{First Last}.jpg`.

### Other content

Any other content, like body text and social links, will need to be updated by pushing commits to the repository. If large tasks are being worked on, such as adding an entirely new tab, consider first creating a branch for intermittent updates, and merging it into the main branch once the project is complete.

## Maintaining the GitHub organisation

The UBC Club MECH GitHub organisation is currently registered under the `ubcmechevents@gmail.com` email. Members' personal GitHub accounts can be added to the organisation, and given permissions to push to repositories.

GitHub recommends that, at all times, _at least two_ members are given the owner rank on the organisation, to ensure that we are always able to maintain access. There is a GitHub account registered under the `ubcclubmech@gmail.com` email address, which will be a permanent owner of the organisation, allowing the president to always have access. I recommend creating a secondary account under the `clubmechwebmaster@gmail.com` email address, which should also be given owner permissions.