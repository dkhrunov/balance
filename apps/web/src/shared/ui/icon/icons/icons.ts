import { CarbonIconType } from '@carbon/icons-react';
import Application from '@carbon/icons-react/es/Application';
import BankVault from '@carbon/icons-react/es/BankVault';
import Basketball from '@carbon/icons-react/es/Basketball';
import Bicycle from '@carbon/icons-react/es/Bicycle';
import Bookmark from '@carbon/icons-react/es/Bookmark';
import Building from '@carbon/icons-react/es/Building';
import Bus from '@carbon/icons-react/es/Bus';
import Cafe from '@carbon/icons-react/es/Cafe';
import Calendar from '@carbon/icons-react/es/Calendar';
import Car from '@carbon/icons-react/es/Car';
import Category from '@carbon/icons-react/es/Category';
import ChartBar from '@carbon/icons-react/es/ChartBar';
import ChartLine from '@carbon/icons-react/es/ChartLine';
import Collaborate from '@carbon/icons-react/es/Collaborate';
import CurrencyDollar from '@carbon/icons-react/es/CurrencyDollar';
import DeliveryParcel from '@carbon/icons-react/es/DeliveryParcel';
import Document from '@carbon/icons-react/es/Document';
import Drink_01 from '@carbon/icons-react/es/Drink_01';
import Education from '@carbon/icons-react/es/Education';
import Events from '@carbon/icons-react/es/Events';
import Favorite from '@carbon/icons-react/es/Favorite';
import Finance from '@carbon/icons-react/es/Finance';
import FlightInternational from '@carbon/icons-react/es/FlightInternational';
import FruitBowl from '@carbon/icons-react/es/FruitBowl';
import GameConsole from '@carbon/icons-react/es/GameConsole';
import GasStation from '@carbon/icons-react/es/GasStation';
import Gift from '@carbon/icons-react/es/Gift';
import Growth from '@carbon/icons-react/es/Growth';
import HealthCross from '@carbon/icons-react/es/HealthCross';
import Home from '@carbon/icons-react/es/Home';
import Hospital from '@carbon/icons-react/es/Hospital';
import Hotel from '@carbon/icons-react/es/Hotel';
import Image from '@carbon/icons-react/es/Image';
import Industry from '@carbon/icons-react/es/Industry';
import Laptop from '@carbon/icons-react/es/Laptop';
import Lightning from '@carbon/icons-react/es/Lightning';
import Locked from '@carbon/icons-react/es/Locked';
import Medication from '@carbon/icons-react/es/Medication';
import Mobile from '@carbon/icons-react/es/Mobile';
import Money from '@carbon/icons-react/es/Money';
import Music from '@carbon/icons-react/es/Music';
import NoodleBowl from '@carbon/icons-react/es/NoodleBowl';
import Partnership from '@carbon/icons-react/es/Partnership';
import Pedestrian from '@carbon/icons-react/es/Pedestrian';
import PedestrianChild from '@carbon/icons-react/es/PedestrianChild';
import PedestrianFamily from '@carbon/icons-react/es/PedestrianFamily';
import Person from '@carbon/icons-react/es/Person';
import Phone from '@carbon/icons-react/es/Phone';
import PiggyBank from '@carbon/icons-react/es/PiggyBank';
import PiggyBankSlot from '@carbon/icons-react/es/PiggyBankSlot';
import Pills from '@carbon/icons-react/es/Pills';
import Portfolio from '@carbon/icons-react/es/Portfolio';
import Purchase from '@carbon/icons-react/es/Purchase';
import Receipt from '@carbon/icons-react/es/Receipt';
import Recycle from '@carbon/icons-react/es/Recycle';
import Renew from '@carbon/icons-react/es/Renew';
import Restaurant from '@carbon/icons-react/es/Restaurant';
import Run from '@carbon/icons-react/es/Run';
import Settings from '@carbon/icons-react/es/Settings';
import ShoppingBag from '@carbon/icons-react/es/ShoppingBag';
import ShoppingCart from '@carbon/icons-react/es/ShoppingCart';
import Soccer from '@carbon/icons-react/es/Soccer';
import Sprout from '@carbon/icons-react/es/Sprout';
import Star from '@carbon/icons-react/es/Star';
import Stethoscope from '@carbon/icons-react/es/Stethoscope';
import Store from '@carbon/icons-react/es/Store';
import Swim from '@carbon/icons-react/es/Swim';
import Tag from '@carbon/icons-react/es/Tag';
import Taxi from '@carbon/icons-react/es/Taxi';
import Theater from '@carbon/icons-react/es/Theater';
import Ticket from '@carbon/icons-react/es/Ticket';
import Tools from '@carbon/icons-react/es/Tools';
import Train from '@carbon/icons-react/es/Train';
import TrashCan from '@carbon/icons-react/es/TrashCan';
import Tree from '@carbon/icons-react/es/Tree';
import Trophy from '@carbon/icons-react/es/Trophy';
import Umbrella from '@carbon/icons-react/es/Umbrella';
import User from '@carbon/icons-react/es/User';
import Wallet from '@carbon/icons-react/es/Wallet';
import Wifi from '@carbon/icons-react/es/Wifi';

/** Carbon icon component used for account/category glyphs. */
export type IconComponent = CarbonIconType;

/**
 * Curated Carbon icon components available in the picker.
 * Keys are the opaque names stored on accounts/categories.
 */
const ICON_COMPONENTS = {
    Application,
    BankVault,
    Basketball,
    Bicycle,
    Bookmark,
    Building,
    Bus,
    Cafe,
    Calendar,
    Car,
    Category,
    ChartBar,
    ChartLine,
    Collaborate,
    CurrencyDollar,
    DeliveryParcel,
    Document,
    Drink_01,
    Education,
    Events,
    Favorite,
    Finance,
    FlightInternational,
    FruitBowl,
    GameConsole,
    GasStation,
    Gift,
    Growth,
    HealthCross,
    Home,
    Hospital,
    Hotel,
    Image,
    Industry,
    Laptop,
    Lightning,
    Locked,
    Medication,
    Mobile,
    Money,
    Music,
    NoodleBowl,
    Partnership,
    Pedestrian,
    PedestrianChild,
    PedestrianFamily,
    Person,
    Phone,
    PiggyBank,
    PiggyBankSlot,
    Pills,
    Portfolio,
    Purchase,
    Receipt,
    Recycle,
    Renew,
    Restaurant,
    Run,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Soccer,
    Sprout,
    Star,
    Stethoscope,
    Store,
    Swim,
    Tag,
    Taxi,
    Theater,
    Ticket,
    Tools,
    Train,
    TrashCan,
    Tree,
    Trophy,
    Umbrella,
    User,
    Wallet,
    Wifi,
} as const satisfies Record<string, IconComponent>;

/** Opaque Carbon icon export name stored on accounts/categories. */
export type IconName = keyof typeof ICON_COMPONENTS;

/** Flat list of every curated icon name. */
export const ICON_NAMES = Object.keys(ICON_COMPONENTS) as IconName[];

/** Set for O(1) membership checks. */
export const ICON_NAME_SET: ReadonlySet<string> = new Set(ICON_NAMES);

/** Picker group: i18n via `icon.groups.<id>`. */
export type IconCatalogGroup = {
    readonly id: string;
    readonly icons: readonly IconName[];
};

/**
 * Curated picker groups for accounts, expense/income categories, and general glyphs.
 * An icon may appear in more than one group.
 */
export const ICON_GROUPS: readonly IconCatalogGroup[] = [
    {
        id: 'accounts',
        icons: [
            'Wallet',
            'Money',
            'PiggyBank',
            'PiggyBankSlot',
            'Purchase',
            'CurrencyDollar',
            'Finance',
            'BankVault',
            'Portfolio',
            'Locked',
            'Building',
            'Home',
            'Store',
        ],
    },
    {
        id: 'expenses',
        icons: [
            'ShoppingCart',
            'ShoppingBag',
            'Restaurant',
            'Cafe',
            'NoodleBowl',
            'FruitBowl',
            'Drink_01',
            'Car',
            'Taxi',
            'Bus',
            'Train',
            'Bicycle',
            'Pedestrian',
            'FlightInternational',
            'GasStation',
            'Hotel',
            'Home',
            'Building',
            'Hospital',
            'HealthCross',
            'Stethoscope',
            'Medication',
            'Pills',
            'Education',
            'Theater',
            'Ticket',
            'Music',
            'GameConsole',
            'Soccer',
            'Basketball',
            'Run',
            'Swim',
            'Phone',
            'Laptop',
            'Mobile',
            'Wifi',
            'Lightning',
            'Tools',
            'DeliveryParcel',
            'TrashCan',
            'Recycle',
            'Sprout',
            'Tree',
            'Umbrella',
            'Gift',
            'PedestrianFamily',
            'PedestrianChild',
            'Calendar',
            'Events',
        ],
    },
    {
        id: 'income',
        icons: [
            'Wallet',
            'Money',
            'CurrencyDollar',
            'Finance',
            'Growth',
            'ChartLine',
            'ChartBar',
            'Gift',
            'Trophy',
            'Partnership',
            'Industry',
            'Collaborate',
            'Portfolio',
            'Renew',
            'Receipt',
        ],
    },
    {
        id: 'general',
        icons: [
            'Star',
            'Tag',
            'Favorite',
            'Bookmark',
            'Category',
            'Settings',
            'User',
            'Person',
            'Image',
            'Document',
            'Application',
        ],
    },
];

/** Fallback when the stored name is missing from the curated set. */
export const FALLBACK_ICON_NAME: IconName = 'Wallet';

/** Sync fallback glyph for unknown / empty icon names. */
export const FALLBACK_ICON: IconComponent = ICON_COMPONENTS[FALLBACK_ICON_NAME];

/**
 * Returns whether `name` is a curated Carbon icon export.
 *
 * @param name Candidate Carbon icon component name.
 */
export function isIconName(name: string): name is IconName {
    return ICON_NAME_SET.has(name);
}

/**
 * Normalizes an API icon value to a curated name (fallback when unknown).
 *
 * @param name Opaque icon name from the API.
 */
export function coerceIconName(name: string | null | undefined): IconName {
    if (name && isIconName(name)) {
        return name;
    }

    return FALLBACK_ICON_NAME;
}

/**
 * Resolves a stored icon name to a Carbon component (sync).
 * Unknown names resolve to {@link FALLBACK_ICON}.
 *
 * @param name Opaque icon name from the API.
 */
export function resolveIcon(name: string | null | undefined): IconComponent {
    if (name && isIconName(name)) {
        return ICON_COMPONENTS[name];
    }

    return FALLBACK_ICON;
}

/**
 * Human-readable label for search / tooltips (splits PascalCase / underscores).
 *
 * @param name Carbon icon export name.
 */
export function formatIconLabel(name: string): string {
    const withSpaces: string[] = [];

    for (let index = 0; index < name.length; index += 1) {
        const char = name[index] ?? '';
        const prev = name[index - 1];
        const next = name[index + 1];

        if (char === '_') {
            withSpaces.push(' ');
            continue;
        }

        const isUpper = char >= 'A' && char <= 'Z';
        const prevIsLower = Boolean(prev && prev >= 'a' && prev <= 'z');
        const prevIsUpper = Boolean(prev && prev >= 'A' && prev <= 'Z');
        const nextIsLower = Boolean(next && next >= 'a' && next <= 'z');

        if (index > 0 && isUpper && (prevIsLower || (prevIsUpper && nextIsLower))) {
            withSpaces.push(' ');
        }

        withSpaces.push(char);
    }

    return withSpaces.join('');
}
