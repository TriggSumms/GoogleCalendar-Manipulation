// import logo from './logo.svg';
import './App.css';
import React from 'react';
import '@mobiscroll/react/dist/css/mobiscroll.min.css';
import { Eventcalendar, snackbar, setOptions, Popup, Button, Input, Textarea, Switch, Datepicker, SegmentedGroup, SegmentedItem } from '@mobiscroll/react';

setOptions({
    theme: 'ios',
    themeVariant: 'light'
});

const now = new Date();
const defaultEvents = [{
    id: 1,
    start: new Date(now.getFullYear(), now.getMonth(), 8, 13),
    end: new Date(now.getFullYear(), now.getMonth(), 8, 13, 30),
    title: 'Lunch @ Butcher\'s',
    color: '#26c57d'
}, {
    id: 2,
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16),
    title: 'General Bad Boi',
    color: '#fd966a'
}, {
    id: 3,
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 18),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 22),
    title: 'Okie Dokie ',
    color: '#37bbe4'
}, {
    id: 4,
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 30),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 30),
    title: 'Stakeholder mtg.',
    color: '#d00f0f'
}];

const viewSettings = {
    calendar: { labels: true }
};
const responsivePopup = {
    medium: {
        display: 'anchored',
        width: 400,
        fullScreen: false,
        touchUi: false
    }
};



 const API_KEY = ''; 
// // This is for testing purposes. Please use your own CLIENT ID & API KEY. You can get it from https://developers.google.com/calendar/quickstart/js
 const CLIENT_ID = '';
//const API_KEY = process.env.HIDDEN_API_KEY; 
//const CLIENT_ID = process.env.HIDDEN_CLIENT_ID;
const CALENDAR_ID = 'primary';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

let calApiLoaded;
let calApiLoading;

function App() {

    const [events, setEvents] = React.useState([]);
    const [firstDay, setFirstDay] = React.useState(new Date(now.getFullYear(), now.getMonth() - 1, -7));
    const [lastDay, setLastDay] = React.useState(new Date(now.getFullYear(), now.getMonth() + 2, 14));

    const [myEvents, setMyEvents] = React.useState(defaultEvents);
    const [tempEvent, setTempEvent] = React.useState(null);
    const [isOpen, setOpen] = React.useState(false);
    const [isEdit, setEdit] = React.useState(false);
    const [anchor, setAnchor] = React.useState(null);
    const [start, startRef] = React.useState(null);
    const [end, endRef] = React.useState(null);
    const [popupEventTitle, setTitle] = React.useState('');
    const [popupEventDescription, setDescription] = React.useState('');
    const [popupEventAllDay, setAllDay] = React.useState(true);
    const [popupEventDate, setDate] = React.useState([]);
    const [popupEventStatus, setStatus] = React.useState('busy');
    const [mySelectedDate, setSelectedDate] = React.useState(now);



    const saveEvent = React.useCallback(() => {
        const newEvent = {
            id: tempEvent.id,
            title: popupEventTitle,
            description: popupEventDescription,
            start: popupEventDate[0],
            end: popupEventDate[1],
            allDay: popupEventAllDay,
            status: popupEventStatus,
            color: tempEvent.color
        };
        if (isEdit) {
            // update the event in the list
            const index = myEvents.findIndex(x => x.id === tempEvent.id);;
            const newEventList = [...myEvents];

            newEventList.splice(index, 1, newEvent);
            setMyEvents(newEventList);
            // here you can update the event in your storage as well
            // ...
        } else {
            // add the new event to the list
            setMyEvents([...myEvents, newEvent]);
            // here you can add the event to your storage as well
            // ...
        }
        setSelectedDate(popupEventDate[0]);
        // close the popup
        setOpen(false);
    }, [isEdit, myEvents, popupEventAllDay, popupEventDate, popupEventDescription, popupEventStatus, popupEventTitle, tempEvent]);

    const deleteEvent = React.useCallback((event) => {
        setMyEvents(myEvents.filter(item => item.id !== event.id));
        setTimeout(() => {
            snackbar({
                button: {
                    action: () => {
                        setMyEvents(prevEvents => [...prevEvents, event]);
                    },
                    text: 'Undo'
                },
                message: 'Event deleted'
            });
        });
    }, [myEvents]);

    const loadPopupForm = React.useCallback((event) => {
        setTitle(event.title);
        setDescription(event.description);
        setDate([event.start, event.end]);
        setAllDay(event.allDay || false);
        setStatus(event.status || 'busy');
    }, []);

    // handle popup form changes

    const titleChange = React.useCallback((ev) => {
        setTitle(ev.target.value);
    }, []);

    const descriptionChange = React.useCallback((ev) => {
        setDescription(ev.target.value);
    }, []);

    const allDayChange = React.useCallback((ev) => {
        setAllDay(ev.target.checked);
    }, []);

    const dateChange = React.useCallback((args) => {
        setDate(args.value);
    }, []);

    const statusChange = React.useCallback((ev) => {
        setStatus(ev.target.value);
    }, []);

    const onDeleteClick = React.useCallback(() => {
        deleteEvent(tempEvent);
        setOpen(false);
    }, [deleteEvent, tempEvent]);

    // scheduler options

    const onSelectedDateChange = React.useCallback((event) => {
        setSelectedDate(event.date);
    });

    const onEventClick = React.useCallback((args) => {
        setEdit(true);
        setTempEvent({ ...args.event });
        // fill popup form with event data
        loadPopupForm(args.event);
        setAnchor(args.domEvent.target);
        setOpen(true);
    }, [loadPopupForm]);

    const onEventCreated = React.useCallback((args) => {
        // createNewEvent(args.event, args.target)
        setEdit(false);
        setTempEvent(args.event)
        // fill popup form with event data
        loadPopupForm(args.event);
        setAnchor(args.target);
        // open the popup
        setOpen(true);
    }, [loadPopupForm]);

    const onEventDeleted = React.useCallback((args) => {
        deleteEvent(args.event)
    }, [deleteEvent]);

    const onEventUpdated = React.useCallback((args) => {
        // here you can update the event in your storage as well, after drag & drop or resize
        // ...
    }, []);

    // datepicker options
    const controls = React.useMemo(() => popupEventAllDay ? ['date'] : ['datetime'], [popupEventAllDay]);
    const respSetting = React.useMemo(() => popupEventAllDay ? {
        medium: {
            controls: ['calendar'],
            touchUi: false
        }
    } : {
            medium: {
                controls: ['calendar', 'time'],
                touchUi: false
            }
        }, [popupEventAllDay]);

    // popup options
    const headerText = React.useMemo(() => isEdit ? 'Edit event' : 'New Event', [isEdit]);
    const popupButtons = React.useMemo(() => {
        if (isEdit) {
            return [
                'cancel',
                {
                    handler: () => {
                        saveEvent();
                    },
                    keyCode: 'enter',
                    text: 'Save',
                    cssClass: 'mbsc-popup-button-primary'
                }
            ];
        }
        else {
            return [
                'cancel',
                {
                    handler: () => {
                        saveEvent();
                    },
                    keyCode: 'enter',
                    text: 'Add',
                    cssClass: 'mbsc-popup-button-primary'
                }
            ];
        }
    }, [isEdit, saveEvent]);

    const onClose = React.useCallback(() => {
        if (!isEdit) {
            // refresh the list, if add popup was canceled, to remove the temporary event
            setMyEvents([...myEvents]);
        }
        setOpen(false);
    }, [isEdit, myEvents]);
    const view = React.useMemo(() => {
        return {
          calendar: { labels: true }
        };
      }, []);
  
      // Load the SDK asynchronously
      const loadGoogleSDK = React.useCallback(() => {
        calApiLoading = true;
        (function (d, s, id) {
          let js;
          let fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) {
            window.onGoogleLoad();
            return;
          }
          js = d.createElement(s);
          js.id = id;
          js.src = "https://apis.google.com/js/api.js?onload=onGoogleLoad";
          js.onload = "onGoogleLoad";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'google-jssdk'));
      }, []);
  
      // Load events from Google Calendar between 2 dates
      const loadEvents = React.useCallback((from, until) => {
        // Only load events if the Google API finished loading
        if (calApiLoaded) {
          window.gapi.client.calendar.events.list({
            'calendarId': CALENDAR_ID,
            'timeMin': from.toISOString(),
            'timeMax': until.toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 100,
            'orderBy': 'startTime'
          }).then((response) => {
            let event;
            let events = response.result.items;
            let eventList = [];
            // Process event list
            for (let i = 0; i < events.length; ++i) {
              event = events[i];
              eventList.push({
                start: new Date(event.start.date || event.start.dateTime),
                end: new Date(event.end.date || event.end.dateTime),
                title: event.summary || 'No Title'
              });
            }
            // Pass the processed events to the calendar
            setEvents(eventList);
          });
        }
      }, []);
  
      // Init the Google API client
      const initClient = React.useCallback(() => {
        window.gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(() => {
          calApiLoaded = true;
          loadEvents(firstDay, lastDay);
        });
      }, [loadEvents, firstDay, lastDay]);
  
      const onPageLoading = React.useCallback((event) => {
        const year = event.month.getFullYear();
        const month = event.month.getMonth();
        // Calculate dates 
        // (pre-load events for previous and next months as well)
        const first = new Date(year, month - 1, -7);
        const last = new Date(year, month + 2, 14);
  
        setTimeout(() => {
          setFirstDay(first);
          setLastDay(last);
        });
  
        loadEvents(first, last);
      }, [loadEvents]);
  
      React.useEffect(() => {
        // Load the Google API Client
        window.onGoogleLoad = () => {
          window.gapi.load('client', initClient);
        }
        if (!calApiLoading) {
          loadGoogleSDK();
        }
      }, [initClient, loadGoogleSDK]);
  







    return <div>
        <Eventcalendar
            view={viewSettings}
            data={myEvents}
            clickToCreate="double"
            dragToCreate={true}
            dragToMove={true}
            dragToResize={true}
            selectedDate={mySelectedDate}
            onSelectedDateChange={onSelectedDateChange}
            onEventClick={onEventClick}
            onEventCreated={onEventCreated}
            onEventDeleted={onEventDeleted}
            onEventUpdated={onEventUpdated}
            data={events}
            onPageLoading={onPageLoading}
        />
        <Popup
            display="bottom"
            fullScreen={true}
            contentPadding={false}
            headerText={headerText}
            anchor={anchor}
            buttons={popupButtons}
            isOpen={isOpen}
            onClose={onClose}
            responsive={responsivePopup}
        >
            <div className="mbsc-form-group">
                <Input label="Title" value={popupEventTitle} onChange={titleChange} />
                <Textarea label="Description" value={popupEventDescription} onChange={descriptionChange} />
            </div>
            <div className="mbsc-form-group">
                <Switch label="All-day" checked={popupEventAllDay} onChange={allDayChange} />
                <Input ref={startRef} label="Starts" />
                <Input ref={endRef} label="Ends" />
                <Datepicker
                    select="range"
                    controls={controls}
                    touchUi={true}
                    startInput={start}
                    endInput={end}
                    showRangeLabels={false}
                    responsive={respSetting}
                    onChange={dateChange}
                    value={popupEventDate}
                />
                <SegmentedGroup onChange={statusChange}>
                    <SegmentedItem value="busy" checked={popupEventStatus === 'busy'}>Show as busy</SegmentedItem>
                    <SegmentedItem value="free" checked={popupEventStatus === 'free'}>Show as free</SegmentedItem>
                </SegmentedGroup>
                {isEdit ? <div className="mbsc-button-group"><Button className="mbsc-button-block" color="danger" variant="outline" onClick={onDeleteClick}>Delete event</Button></div> : null}
            </div>
        </Popup>
    </div>
}

export default App;
