import styles from './icons.module.css';
import { Icon } from '@blueprintjs/core';
import { MdImages } from '@meronex/icons/ios';
import { FaMagic, FaCubes, FaPaintRoller } from '@meronex/icons/fa';
import { MdBurstMode, MdGradient, MdPalette, MdBlurOff, MdWbIncandescent } from '@meronex/icons/md';
import {
	MdcImageSearchOutline, MdcDraw, MdcPlaylistEdit, MdcWeight, MdcSeedOutline, MdcPiggyBank,
} from '@meronex/icons/mdc';
import { AiOutlineInfoCircle } from '@meronex/icons/ai';
import { BiLayer, BisEraser } from '@meronex/icons/bi';
import { VscServerProcess } from '@meronex/icons/vsc';
import { GrGoogle } from '@meronex/icons/gr';
import { IosColorFilter } from '@meronex/icons/ios';


/** Common Icon **/
export const ArrowDown: JSX.Element = <Icon icon="chevron-down" />;
export const InfoIcon: JSX.Element = <AiOutlineInfoCircle className={styles.midIcon} />;

/** Tool Kit Panel Icon **/
export const FaMagicIcon: JSX.Element = <FaMagic className={styles.toolKitPanelTabIcon} />;
export const MyImageFiltersIcon: JSX.Element = <Icon icon="clean" className={styles.toolKitPanelTabIcon} />;

/** Tool Kit Card Icon **/
export const ToolKitCardDefaultIcon: JSX.Element = <MdcPiggyBank className={styles.toolKitCardHeaderIcon} />;
export const SRIcon: JSX.Element = <MdBurstMode className={styles.toolKitCardHeaderIcon} />;
export const DeNoiseIcon: JSX.Element = <MdGradient className={styles.toolKitCardHeaderIcon} />;
export const DeBlurIcon: JSX.Element = <MdBlurOff className={styles.toolKitCardHeaderIcon} />;
export const LowLightIcon: JSX.Element = <MdWbIncandescent className={styles.toolKitCardHeaderIcon} />;
export const BackgroundRemoverIcon: JSX.Element = <BisEraser className={styles.toolKitCardHeaderIcon} />;
export const ColorizationIcon: JSX.Element = <MdPalette className={styles.toolKitCardHeaderIcon} />;
export const GetLUTIcon: JSX.Element = <FaCubes className={styles.toolKitCardHeaderIcon} />;
export const ApplyLUTIcon: JSX.Element = <FaPaintRoller className={styles.toolKitCardHeaderIcon} />;

/** EffectsTab Icon **/
export const BasicOptIcon: JSX.Element = <Icon icon="left-join" />;
export const AdjustOptIcon: JSX.Element = <Icon icon="settings" />;
export const FiltersOptIcon: JSX.Element = <IosColorFilter className={styles.midIcon} />;

/** Side Panel Icon **/
export const AISearchIcon: JSX.Element = <MdcImageSearchOutline className={styles.midIcon} />;
export const AIDrawIcon: JSX.Element = <MdcDraw className={styles.midIcon} />;
export const CloudUploadIcon: JSX.Element = <Icon icon="cloud-upload" />;
export const UploadIcon: JSX.Element = <Icon icon="upload" />;
export const ExportIcon: JSX.Element = <Icon icon="export" />;
/** AISearch Panel Icon **/
export const EmptyIcon: JSX.Element = <MdImages className={styles.emptyIcon} />;

/** AIDraw Panel Icon **/
export const AIDrawTitleIcon: JSX.Element = <Icon icon="cog" />;
export const PromptIcon: JSX.Element = <MdcPlaylistEdit className={styles.AIDrawIcon} />;
export const WeightIcon: JSX.Element = <MdcWeight className={styles.AIDrawIcon} />;
export const StepsIcon: JSX.Element = <BiLayer className={styles.AIDrawIcon} />;
export const SeedIcon: JSX.Element = <MdcSeedOutline className={styles.AIDrawIcon} />;
export const AdvancedIcon: JSX.Element = <VscServerProcess className={styles.AIDrawIcon} />;

/** Login Page **/
export const GrGoogleIcon: JSX.Element = <GrGoogle className={styles.midIcon} />;
export const AvatarIcon: JSX.Element = <Icon icon="user" />;