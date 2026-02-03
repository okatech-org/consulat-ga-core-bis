/**
 * CountrySettingsPanel Component
 * Admin panel for configuring country-specific organization settings
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Phone,
    Mail,
    Globe,
    MapPin,
    Clock,
    Calendar,
    Plus,
    Trash2,
    Building2,
} from 'lucide-react';
import { getCountryName } from '@/utils/consulate-utils';

interface DaySchedule {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

interface ContactInfo {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    postalCode?: string;
}

interface Holiday {
    date: string;
    name: string;
}

interface Closure {
    startDate: string;
    endDate: string;
    reason: string;
}

interface CountrySettings {
    countryCode: string;
    contact: ContactInfo;
    schedule: Record<string, DaySchedule>;
    holidays: Holiday[];
    closures: Closure[];
}

interface CountrySettingsPanelProps {
    countryCode: string;
    settings: CountrySettings;
    onChange: (settings: CountrySettings) => void;
    disabled?: boolean;
}

const DAYS = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' },
];

const DEFAULT_SCHEDULE: DaySchedule = {
    isOpen: true,
    openTime: '09:00',
    closeTime: '17:00',
};

/**
 * Panel for managing country-specific settings
 */
export function CountrySettingsPanel({
    countryCode,
    settings,
    onChange,
    disabled = false,
}: CountrySettingsPanelProps) {
    const countryName = getCountryName(countryCode);

    // Update contact info
    const updateContact = (field: keyof ContactInfo, value: string) => {
        onChange({
            ...settings,
            contact: {
                ...settings.contact,
                [field]: value,
            },
        });
    };

    // Update schedule for a day
    const updateSchedule = (day: string, update: Partial<DaySchedule>) => {
        onChange({
            ...settings,
            schedule: {
                ...settings.schedule,
                [day]: {
                    ...(settings.schedule[day] || DEFAULT_SCHEDULE),
                    ...update,
                },
            },
        });
    };

    // Add a holiday
    const addHoliday = () => {
        onChange({
            ...settings,
            holidays: [
                ...settings.holidays,
                { date: new Date().toISOString().split('T')[0], name: '' },
            ],
        });
    };

    // Remove a holiday
    const removeHoliday = (index: number) => {
        onChange({
            ...settings,
            holidays: settings.holidays.filter((_, i) => i !== index),
        });
    };

    // Update a holiday
    const updateHoliday = (index: number, update: Partial<Holiday>) => {
        onChange({
            ...settings,
            holidays: settings.holidays.map((h, i) => (i === index ? { ...h, ...update } : h)),
        });
    };

    // Add a closure
    const addClosure = () => {
        const today = new Date().toISOString().split('T')[0];
        onChange({
            ...settings,
            closures: [
                ...settings.closures,
                { startDate: today, endDate: today, reason: '' },
            ],
        });
    };

    // Remove a closure
    const removeClosure = (index: number) => {
        onChange({
            ...settings,
            closures: settings.closures.filter((_, i) => i !== index),
        });
    };

    // Update a closure
    const updateClosure = (index: number, update: Partial<Closure>) => {
        onChange({
            ...settings,
            closures: settings.closures.map((c, i) => (i === index ? { ...c, ...update } : c)),
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                        <CardTitle>Configuration - {countryName}</CardTitle>
                        <CardDescription>
                            Paramètres spécifiques pour la représentation en {countryName}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* Contact Section */}
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 font-medium">
                        <MapPin className="h-4 w-4" />
                        Coordonnées
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor={`${countryCode}-email`}>
                                <Mail className="mr-1 inline h-3 w-3" />
                                Email
                            </Label>
                            <Input
                                id={`${countryCode}-email`}
                                type="email"
                                value={settings.contact.email || ''}
                                onChange={(e) => updateContact('email', e.target.value)}
                                placeholder="contact@consulat.ga"
                                disabled={disabled}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`${countryCode}-phone`}>
                                <Phone className="mr-1 inline h-3 w-3" />
                                Téléphone
                            </Label>
                            <Input
                                id={`${countryCode}-phone`}
                                type="tel"
                                value={settings.contact.phone || ''}
                                onChange={(e) => updateContact('phone', e.target.value)}
                                placeholder="+33 1 23 45 67 89"
                                disabled={disabled}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`${countryCode}-website`}>
                                <Globe className="mr-1 inline h-3 w-3" />
                                Site web
                            </Label>
                            <Input
                                id={`${countryCode}-website`}
                                type="url"
                                value={settings.contact.website || ''}
                                onChange={(e) => updateContact('website', e.target.value)}
                                placeholder="https://www.exemple.ga"
                                disabled={disabled}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`${countryCode}-city`}>Ville</Label>
                            <Input
                                id={`${countryCode}-city`}
                                value={settings.contact.city || ''}
                                onChange={(e) => updateContact('city', e.target.value)}
                                placeholder="Paris"
                                disabled={disabled}
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor={`${countryCode}-address`}>Adresse</Label>
                            <Input
                                id={`${countryCode}-address`}
                                value={settings.contact.address || ''}
                                onChange={(e) => updateContact('address', e.target.value)}
                                placeholder="123 Avenue des Champs-Élysées, 75008 Paris"
                                disabled={disabled}
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Schedule Section */}
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 font-medium">
                        <Clock className="h-4 w-4" />
                        Horaires d'ouverture
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {DAYS.map(({ key, label }) => {
                            const daySchedule = settings.schedule[key] || DEFAULT_SCHEDULE;

                            return (
                                <div
                                    key={key}
                                    className={`rounded-lg border p-3 ${daySchedule.isOpen ? 'border-primary/30 bg-primary/5' : 'bg-muted/50'
                                        }`}
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="font-medium text-sm">{label}</span>
                                        <Switch
                                            checked={daySchedule.isOpen}
                                            onCheckedChange={(checked) => updateSchedule(key, { isOpen: checked })}
                                            disabled={disabled}
                                        />
                                    </div>

                                    {daySchedule.isOpen && (
                                        <div className="flex items-center gap-1 text-xs">
                                            <Input
                                                type="time"
                                                value={daySchedule.openTime}
                                                onChange={(e) => updateSchedule(key, { openTime: e.target.value })}
                                                className="h-7 w-20 text-xs"
                                                disabled={disabled}
                                            />
                                            <span className="text-muted-foreground">-</span>
                                            <Input
                                                type="time"
                                                value={daySchedule.closeTime}
                                                onChange={(e) => updateSchedule(key, { closeTime: e.target.value })}
                                                className="h-7 w-20 text-xs"
                                                disabled={disabled}
                                            />
                                        </div>
                                    )}

                                    {!daySchedule.isOpen && (
                                        <Badge variant="secondary" className="text-xs">
                                            Fermé
                                        </Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Separator />

                {/* Holidays Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-2 font-medium">
                            <Calendar className="h-4 w-4" />
                            Jours fériés
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addHoliday}
                            disabled={disabled}
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Ajouter
                        </Button>
                    </div>

                    {settings.holidays.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun jour férié configuré</p>
                    ) : (
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {settings.holidays.map((holiday, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 rounded-lg border p-2"
                                >
                                    <Input
                                        type="date"
                                        value={holiday.date}
                                        onChange={(e) => updateHoliday(index, { date: e.target.value })}
                                        className="h-8 w-32 text-xs"
                                        disabled={disabled}
                                    />
                                    <Input
                                        placeholder="Nom"
                                        value={holiday.name}
                                        onChange={(e) => updateHoliday(index, { name: e.target.value })}
                                        className="h-8 flex-1 text-xs"
                                        disabled={disabled}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => removeHoliday(index)}
                                        disabled={disabled}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Separator />

                {/* Closures Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-2 font-medium">
                            <Calendar className="h-4 w-4" />
                            Fermetures exceptionnelles
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addClosure}
                            disabled={disabled}
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Ajouter
                        </Button>
                    </div>

                    {settings.closures.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucune fermeture exceptionnelle</p>
                    ) : (
                        <div className="space-y-2">
                            {settings.closures.map((closure, index) => (
                                <div
                                    key={index}
                                    className="flex flex-wrap items-center gap-2 rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-1">
                                        <Label className="text-xs">Du</Label>
                                        <Input
                                            type="date"
                                            value={closure.startDate}
                                            onChange={(e) => updateClosure(index, { startDate: e.target.value })}
                                            className="h-8 w-32 text-xs"
                                            disabled={disabled}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Label className="text-xs">au</Label>
                                        <Input
                                            type="date"
                                            value={closure.endDate}
                                            onChange={(e) => updateClosure(index, { endDate: e.target.value })}
                                            className="h-8 w-32 text-xs"
                                            disabled={disabled}
                                        />
                                    </div>
                                    <Input
                                        placeholder="Motif"
                                        value={closure.reason}
                                        onChange={(e) => updateClosure(index, { reason: e.target.value })}
                                        className="h-8 flex-1 min-w-[150px] text-xs"
                                        disabled={disabled}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => removeClosure(index)}
                                        disabled={disabled}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default CountrySettingsPanel;
