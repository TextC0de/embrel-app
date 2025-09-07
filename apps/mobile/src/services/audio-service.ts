import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { SoundType } from '../types';

/**
 * Audio feedback service for EMBREL
 * Provides sound and haptic feedback for different app actions
 * Uses Expo AV for audio playback
 */
class AudioService {
  private isInitialized = false;
  private sounds: { [key: string]: Audio.Sound } = {};

  /**
   * Initialize audio service and preload sounds
   */
  async initialize(): Promise<void> {
    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Preload sound files
      await this.preloadSounds();
      
      this.isInitialized = true;
      console.log('✅ Audio service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize audio service:', error);
    }
  }

  /**
   * Preload all audio files
   */
  private async preloadSounds(): Promise<void> {
    try {
      // Load success sound (successed.mp3)
      const { sound: successSound } = await Audio.Sound.createAsync(
        require('../../assets/audio/successed.mp3')
      );
      this.sounds['success'] = successSound;

      // Load error sound (error.mp3) 
      const { sound: errorSound } = await Audio.Sound.createAsync(
        require('../../assets/audio/error.mp3')
      );
      this.sounds['error'] = errorSound;
      
      // Warning uses the same as error for now
      this.sounds['warning'] = errorSound;

      console.log('✅ Audio files preloaded');
    } catch (error) {
      console.error('❌ Failed to preload sounds:', error);
    }
  }

  /**
   * Plays audio feedback based on action type
   * @param type - Type of sound to play
   * @param withHaptic - Whether to include haptic feedback
   */
  async playSound(type: SoundType, withHaptic: boolean = true): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Play haptic feedback first for immediate response
      if (withHaptic) {
        await this.playHaptic(type);
      }

      // Play corresponding audio feedback
      switch (type) {
        case 'success':
          await this.playSuccessSound();
          break;
        case 'error':
          await this.playErrorSound();
          break;
        case 'warning':
          await this.playWarningSound();
          break;
        default:
          console.warn(`Unknown sound type: ${type}`);
      }
    } catch (error) {
      console.error(`❌ Failed to play ${type} sound:`, error);
    }
  }

  /**
   * Play success sound (single BIP for successful QR scan)
   */
  private async playSuccessSound(): Promise<void> {
    try {
      console.log('🔊 Playing success sound: BIP');
      const sound = this.sounds['success'];
      if (sound) {
        await sound.setPositionAsync(0); // Reset to beginning
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Failed to play success sound:', error);
    }
  }

  /**
   * Play error sound (double BIP BIP for flight number error)
   */
  private async playErrorSound(): Promise<void> {
    try {
      console.log('🔊 Playing error sound: BIP BIP');
      const sound = this.sounds['error'];
      if (sound) {
        await sound.setPositionAsync(0); // Reset to beginning
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Failed to play error sound:', error);
    }
  }

  /**
   * Play warning sound
   */
  private async playWarningSound(): Promise<void> {
    try {
      console.log('🔊 Playing warning sound');
      const sound = this.sounds['warning'];
      if (sound) {
        await sound.setPositionAsync(0); // Reset to beginning
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Failed to play warning sound:', error);
    }
  }

  /**
   * Play haptic feedback based on sound type
   */
  private async playHaptic(type: SoundType): Promise<void> {
    try {
      switch (type) {
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
      }
    } catch (error) {
      console.error('Failed to play haptic feedback:', error);
    }
  }

  /**
   * Cleanup audio resources
   */
  async cleanup(): Promise<void> {
    try {
      // Unload all sounds from memory
      for (const soundKey in this.sounds) {
        const sound = this.sounds[soundKey];
        if (sound) {
          await sound.unloadAsync();
        }
      }
      this.sounds = {};
      this.isInitialized = false;
      console.log('✅ Audio service cleaned up');
    } catch (error) {
      console.error('❌ Failed to cleanup audio service:', error);
    }
  }
}

// Export singleton instance
export const audioService = new AudioService(); 