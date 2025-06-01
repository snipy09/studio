
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Timer, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_SHORT_BREAK_MINUTES = 5;
const DEFAULT_LONG_BREAK_MINUTES = 15;
const DEFAULT_CYCLES_PER_LONG_BREAK = 4;

export function PomodoroTimer() {
  const { toast } = useToast();

  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MINUTES);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(DEFAULT_SHORT_BREAK_MINUTES);
  const [longBreakMinutes, setLongBreakMinutes] = useState(DEFAULT_LONG_BREAK_MINUTES);
  const [cyclesPerLongBreak, setCyclesPerLongBreak] = useState(DEFAULT_CYCLES_PER_LONG_BREAK);

  const [mode, setMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  
  const [isSettingsView, setIsSettingsView] = useState(false);
  
  // Temporary state for input fields
  const [tempWorkMinutes, setTempWorkMinutes] = useState(String(DEFAULT_WORK_MINUTES));
  const [tempShortBreakMinutes, setTempShortBreakMinutes] = useState(String(DEFAULT_SHORT_BREAK_MINUTES));
  const [tempLongBreakMinutes, setTempLongBreakMinutes] = useState(String(DEFAULT_LONG_BREAK_MINUTES));
  const [tempCyclesPerLongBreak, setTempCyclesPerLongBreak] = useState(String(DEFAULT_CYCLES_PER_LONG_BREAK));


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleModeSwitch = useCallback(() => {
    setIsActive(false);
    let nextMode: PomodoroMode = 'work';
    let nextTime = workMinutes * 60;
    let newCompletedCycles = completedCycles;

    if (mode === 'work') {
      newCompletedCycles++;
      setCompletedCycles(newCompletedCycles);
      if (newCompletedCycles % cyclesPerLongBreak === 0) {
        nextMode = 'longBreak';
        nextTime = longBreakMinutes * 60;
        toast({ title: "Time for a Long Break!", description: `Enjoy your ${longBreakMinutes} minutes.` });
      } else {
        nextMode = 'shortBreak';
        nextTime = shortBreakMinutes * 60;
        toast({ title: "Time for a Short Break!", description: `Take ${shortBreakMinutes} minutes.` });
      }
    } else if (mode === 'shortBreak') {
      nextMode = 'work';
      nextTime = workMinutes * 60;
      toast({ title: "Back to Work!", description: `Focus for ${workMinutes} minutes.` });
    } else if (mode === 'longBreak') {
      nextMode = 'work';
      nextTime = workMinutes * 60;
      setCompletedCycles(0); // Reset cycles after long break
      toast({ title: "Back to Work!", description: `Focus for ${workMinutes} minutes.` });
    }
    
    setMode(nextMode);
    setTimeLeft(nextTime);
  }, [mode, workMinutes, shortBreakMinutes, longBreakMinutes, cyclesPerLongBreak, completedCycles, toast]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleModeSwitch();
      // Consider adding a sound notification here in the future
      // new Notification('Pomodoro Timer', { body: `${mode.charAt(0).toUpperCase() + mode.slice(1)} session ended!` });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, handleModeSwitch]);

  const toggleTimer = () => {
    if (timeLeft === 0) { // If timer ended, pressing play should start next mode
        handleModeSwitch();
        setIsActive(true); // Start the new mode immediately
    } else {
        setIsActive(!isActive);
    }
  };

  const resetTimer = useCallback((resetSettings = false) => {
    setIsActive(false);
    setMode('work');
    if (resetSettings) {
        setWorkMinutes(DEFAULT_WORK_MINUTES);
        setShortBreakMinutes(DEFAULT_SHORT_BREAK_MINUTES);
        setLongBreakMinutes(DEFAULT_LONG_BREAK_MINUTES);
        setCyclesPerLongBreak(DEFAULT_CYCLES_PER_LONG_BREAK);
        setTimeLeft(DEFAULT_WORK_MINUTES * 60);
        setTempWorkMinutes(String(DEFAULT_WORK_MINUTES));
        setTempShortBreakMinutes(String(DEFAULT_SHORT_BREAK_MINUTES));
        setTempLongBreakMinutes(String(DEFAULT_LONG_BREAK_MINUTES));
        setTempCyclesPerLongBreak(String(DEFAULT_CYCLES_PER_LONG_BREAK));
    } else {
        setTimeLeft(workMinutes * 60);
    }
    setCompletedCycles(0);
  }, [workMinutes]);

  const handleSaveSettings = () => {
    const newWork = parseInt(tempWorkMinutes, 10);
    const newShort = parseInt(tempShortBreakMinutes, 10);
    const newLong = parseInt(tempLongBreakMinutes, 10);
    const newCycles = parseInt(tempCyclesPerLongBreak, 10);

    if (isNaN(newWork) || newWork <= 0 ||
        isNaN(newShort) || newShort <= 0 ||
        isNaN(newLong) || newLong <= 0 ||
        isNaN(newCycles) || newCycles <= 0) {
      toast({ title: "Invalid Settings", description: "Durations and cycles must be positive numbers.", variant: "destructive"});
      return;
    }
    
    setWorkMinutes(newWork);
    setShortBreakMinutes(newShort);
    setLongBreakMinutes(newLong);
    setCyclesPerLongBreak(newCycles);

    // If current mode is work and timer hasn't started or is paused, update timeLeft
    if (mode === 'work' && !isActive) {
      setTimeLeft(newWork * 60);
    }
    // Similar logic for other modes if needed, or just let it update on next cycle.

    setIsSettingsView(false);
    toast({ title: "Settings Saved!", description: "Pomodoro timer updated." });
  };

  const getModeDisplayName = (): string => {
    if (mode === 'work') return 'Work';
    if (mode === 'shortBreak') return 'Short Break';
    if (mode === 'longBreak') return 'Long Break';
    return '';
  };
  
  // Update timeLeft if duration for current mode changes and timer is not active
  useEffect(() => {
    if (!isActive) {
      if (mode === 'work') setTimeLeft(workMinutes * 60);
      else if (mode === 'shortBreak') setTimeLeft(shortBreakMinutes * 60);
      else if (mode === 'longBreak') setTimeLeft(longBreakMinutes * 60);
    }
  }, [workMinutes, shortBreakMinutes, longBreakMinutes, mode, isActive]);


  return (
    <DropdownMenu onOpenChange={(open) => { if (!open) setIsSettingsView(false); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Timer className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Pomodoro Timer</span>
           {isActive && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary/80"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-4">
        {!isSettingsView ? (
          <>
            <DropdownMenuLabel className="text-center text-lg font-semibold">
              {getModeDisplayName()}
            </DropdownMenuLabel>
            <div className="my-4 flex flex-col items-center space-y-4">
              <div className="text-5xl font-mono font-bold text-primary">
                {formatTime(timeLeft)}
              </div>
              <div className="flex space-x-2 w-full">
                <Button onClick={toggleTimer} className="flex-1" variant={isActive ? "destructive" : "default"}>
                  {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                  {isActive ? 'Pause' : (timeLeft === 0 ? 'Next' : 'Start')}
                </Button>
                <Button onClick={() => resetTimer(false)} variant="outline" className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <Button variant="ghost" className="w-full justify-center" onClick={() => setIsSettingsView(true)}>
              <Settings className="mr-2 h-4 w-4" /> Timer Settings
            </Button>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="text-center text-lg font-semibold">Timer Settings</DropdownMenuLabel>
            <div className="space-y-3 mt-4">
              <div>
                <Label htmlFor="workDuration" className="text-xs">Work (min)</Label>
                <Input id="workDuration" type="number" value={tempWorkMinutes} onChange={(e) => setTempWorkMinutes(e.target.value)} className="h-8"/>
              </div>
              <div>
                <Label htmlFor="shortBreakDuration" className="text-xs">Short Break (min)</Label>
                <Input id="shortBreakDuration" type="number" value={tempShortBreakMinutes} onChange={(e) => setTempShortBreakMinutes(e.target.value)} className="h-8"/>
              </div>
              <div>
                <Label htmlFor="longBreakDuration" className="text-xs">Long Break (min)</Label>
                <Input id="longBreakDuration" type="number" value={tempLongBreakMinutes} onChange={(e) => setTempLongBreakMinutes(e.target.value)} className="h-8"/>
              </div>
              <div>
                <Label htmlFor="cyclesPerLongBreak" className="text-xs">Pomodoros per Long Break</Label>
                <Input id="cyclesPerLongBreak" type="number" value={tempCyclesPerLongBreak} onChange={(e) => setTempCyclesPerLongBreak(e.target.value)} className="h-8"/>
              </div>
            </div>
            <DropdownMenuSeparator className="my-4" />
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" onClick={() => {
                setIsSettingsView(false);
                // Reset temp values to actual stored values if canceling
                setTempWorkMinutes(String(workMinutes));
                setTempShortBreakMinutes(String(shortBreakMinutes));
                setTempLongBreakMinutes(String(longBreakMinutes));
                setTempCyclesPerLongBreak(String(cyclesPerLongBreak));
              }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveSettings}>Save</Button>
            </div>
            <Button variant="link" size="sm" className="w-full mt-2 text-xs" onClick={() => { resetTimer(true); setIsSettingsView(false); }}>
                Reset to Defaults
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

