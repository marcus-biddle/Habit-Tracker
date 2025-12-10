import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { Button } from "../../../components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { DirectionProvider } from "@radix-ui/react-direction"
import { toast } from 'sonner'
import { presetGroups, type PresetGroup } from '../../../data/presetGroups'
import { importPresetGroup, getHabitGroupsByUserId, type HabitInsert } from '../../../api/supabase'
import { Loader2, Plus, Sparkles, Upload, FileText, CircleAlert, CircleCheckBig, NotebookPenIcon, SquareCheck, SquareChevronRightIcon } from 'lucide-react'
import Papa from 'papaparse'
import { supabase } from '../../../api/client/client'
import type { Habit } from '../../Tables/Habits/columns'

type PresetGroupsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  habits?: Habit[];
};

export function PresetGroupsSheet({ open, onOpenChange, onSuccess, habits = [] }: PresetGroupsSheetProps) {
  const { user } = useAuth();
  const [importingGroupId, setImportingGroupId] = useState<string | null>(null);
  
  // CSV Import state
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  const [userInput, setUserInput] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [habitPopoverOpen, setHabitPopoverOpen] = useState(false);

  const handleImportGroup = async (presetGroup: PresetGroup) => {
    if (!user) {
      toast.error("You must be logged in to import a preset group");
      return;
    }

    setImportingGroupId(presetGroup.id);
    try {
      // Check if group already exists to show appropriate message
      const existingGroups = await getHabitGroupsByUserId(user.id);
      const groupExists = existingGroups.some(g => g.name.toLowerCase() === presetGroup.name.toLowerCase());
      
      const result = await importPresetGroup(user.id, presetGroup);
      
      // Build a detailed success message based on what happened
      const messageParts: string[] = [];
      
      if (result.regrouped > 0) {
        messageParts.push(`${result.regrouped} habit${result.regrouped > 1 ? 's' : ''} regrouped`);
      }
      
      if (result.created > 0) {
        messageParts.push(`${result.created} new habit${result.created > 1 ? 's' : ''} created`);
      }
      
      if (result.skipped > 0) {
        messageParts.push(`${result.skipped} habit${result.skipped > 1 ? 's' : ''} already in group`);
      }
      
      let successMessage = '';
      if (groupExists) {
        successMessage = `Updated "${presetGroup.name}" group`;
      } else {
        successMessage = `Successfully imported "${presetGroup.name}" group`;
      }
      
      if (messageParts.length > 0) {
        successMessage += `: ${messageParts.join(', ')}`;
      }
      
      toast.success(successMessage, {
        duration: 5000,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error importing preset group:", error);
      
      const errorMessage = error?.message || `Failed to import "${presetGroup.name}"`;
      toast.error(errorMessage);
    } finally {
      setImportingGroupId(null);
    }
  };

  const handleCsvFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
  };

  const importHabitEntries = async (csvData: any[]) => {
    if (!user) return;

    const validEntries = csvData
      .map(row => {
        const value = Number(row.value);
        if (isNaN(value) || value <= 0) {
          console.warn(`Skipping invalid value: ${row.value}`);
          return null;
        }

        return {
          date: row.date,
          habit_name: activeHabit ? activeHabit.name : userInput,
          value: value,
          notes: `CSV Import`
        };
      })
      .filter((entry: any): entry is NonNullable<typeof entry> => entry !== null);

    const { data, error } = await supabase.rpc('import_habit_entries', {
      p_user_id: user.id,
      p_entries: validEntries
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const handleCsvImport = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file");
      return;
    }

    if (!activeHabit && !userInput.trim()) {
      toast.error("Please select or enter a habit name");
      return;
    }

    setIsImportingCsv(true);
    try {
      Papa.parse(csvFile, {
        header: true,
        complete: async (results: Papa.ParseResult<unknown>) => {
          try {
            const csvData = results.data as Array<{
              date: string;
              habit_name: string;
              value: number;
              notes?: string;
            }>;

            await importHabitEntries(csvData);
            toast.success("Successfully imported habit entries!");
            setCsvFile(null);
            setActiveHabit(null);
            setUserInput('');
            onSuccess();
            onOpenChange(false);
          } catch (error: any) {
            console.error("Error importing CSV:", error);
            toast.error(error?.message || "Failed to import CSV entries");
          } finally {
            setIsImportingCsv(false);
          }
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          toast.error("Failed to parse CSV file");
          setIsImportingCsv(false);
        }
      });
    } catch (error: any) {
      console.error("Error processing CSV:", error);
      toast.error("Failed to process CSV file");
      setIsImportingCsv(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-2xl flex flex-col p-0 overflow-y-auto">
        <SheetHeader className="px-6 pt-6 pb-4 sticky top-0 bg-background z-10 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <SheetTitle>Import & Presets</SheetTitle>
          </div>
          <SheetDescription>
            Import preset habit groups or upload CSV data for your habits.
          </SheetDescription>
        </SheetHeader>

        <DirectionProvider dir="ltr">
          <Tabs defaultValue="presets" className="flex flex-col flex-1 min-h-0">
            <div className="px-6 pt-4 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="presets" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Preset Groups
                </TabsTrigger>
                <TabsTrigger value="csv" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  CSV Import
                </TabsTrigger>
              </TabsList>
            </div>
          
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <TabsContent value="presets" className="mt-0 space-y-4">
              {presetGroups.map((presetGroup) => (
            <Card key={presetGroup.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{presetGroup.name}</CardTitle>
                      {presetGroup.color && (
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: presetGroup.color }}
                        />
                      )}
                    </div>
                    <CardDescription>{presetGroup.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{presetGroup.habits.length} habits</Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Habits included:</p>
                    <ul className="space-y-1">
                      {presetGroup.habits.map((habit: Omit<HabitInsert, 'user_id' | 'group_id'>, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span className="flex-1">
                            <span className="font-medium">{habit.name}</span>
                            {habit.description && (
                              <span className="text-muted-foreground ml-1">- {habit.description}</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleImportGroup(presetGroup)}
                  disabled={importingGroupId !== null}
                  className="w-full"
                  variant="default"
                >
                  {importingGroupId === presetGroup.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Import Group
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="csv" className="mt-0">
              <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Import Habit Entries from CSV</CardTitle>
                </div>
                <CardDescription>
                  Upload a CSV file to import historical habit entry data. The CSV should have columns: date, value (and optionally notes).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Habit Name</Label>
                  <div className="flex w-full items-center gap-2">
                    {activeHabit || userInput !== '' ? (
                      <CircleCheckBig className="text-green-500 h-5 w-5 shrink-0" />
                    ) : (
                      <CircleAlert className="h-5 w-5 shrink-0 text-muted-foreground" />
                    )}
                    <div className="relative w-full">
                      <Input
                        placeholder="Enter habit name or select existing"
                        value={activeHabit ? activeHabit.name : userInput}
                        onChange={(e) => {
                          setActiveHabit(null);
                          setUserInput(e.target.value);
                        }}
                        className="pr-10"
                      />
                      {habits.length > 0 && (
                        <Popover open={habitPopoverOpen} onOpenChange={setHabitPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                            >
                              <NotebookPenIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0" align="end">
                            <div className="p-4 border-b">
                              <h4 className="font-semibold text-sm">Select a Habit</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Choose an existing habit to import entries for.
                              </p>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {habits.map((habit) => (
                                <div
                                  key={habit.id}
                                  className="p-3 cursor-pointer hover:bg-muted transition-colors flex items-center justify-between border-b last:border-b-0"
                                  onClick={() => {
                                    setActiveHabit(habit);
                                    setUserInput('');
                                    setHabitPopoverOpen(false);
                                  }}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{habit.name}</p>
                                    {habit.description && (
                                      <p className="text-xs text-muted-foreground truncate">{habit.description}</p>
                                    )}
                                  </div>
                                  {activeHabit?.id === habit.id ? (
                                    <SquareCheck className="h-4 w-4 text-green-500 shrink-0 ml-2" />
                                  ) : (
                                    <SquareChevronRightIcon className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select an existing habit or enter a new habit name. If the habit doesn't exist, it will be created.
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleCsvFileUpload}
                      disabled={isImportingCsv || (!activeHabit && !userInput.trim())}
                      className="flex-1"
                    />
                    {csvFile && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {csvFile.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    CSV format: date (YYYY-MM-DD), value (number), notes (optional)
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleCsvImport}
                  disabled={isImportingCsv || !csvFile || (!activeHabit && !userInput.trim())}
                  className="w-full"
                  variant="default"
                >
                  {isImportingCsv ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import CSV
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            </TabsContent>
            </div>
          </Tabs>
        </DirectionProvider>
      </SheetContent>
    </Sheet>
  );
}

