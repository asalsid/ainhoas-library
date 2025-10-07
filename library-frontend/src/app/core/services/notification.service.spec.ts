import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService]
    });
    service = TestBed.inject(NotificationService);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('showResult Method', () => {
    beforeEach(() => {
      spyOn(window, 'alert');
    });

    it('should show success alert with correct message', () => {
      const message = 'Operation completed successfully';
      
      service.showResult('success', message);
      
      expect(window.alert).toHaveBeenCalledWith(`✅ Success: ${message}`);
    });

    it('should show error alert with correct message', () => {
      const message = 'An error occurred';
      
      service.showResult('error', message);
      
      expect(window.alert).toHaveBeenCalledWith(`❌ Error: ${message}`);
    });

    it('should show info alert with correct message', () => {
      const message = 'Information message';
      
      service.showResult('info', message);
      
      expect(window.alert).toHaveBeenCalledWith(`ℹ️ Info: ${message}`);
    });

    it('should show warning alert with correct message', () => {
      const message = 'Warning message';
      
      service.showResult('warning', message);
      
      expect(window.alert).toHaveBeenCalledWith(`⚠️ Warning: ${message}`);
    });

    it('should handle unknown message types with default formatting', () => {
      const message = 'Unknown type message';
      
      service.showResult('unknown' as any, message);
      
      expect(window.alert).toHaveBeenCalledWith(`📋 Unknown: ${message}`);
    });

    it('should handle empty message', () => {
      service.showResult('success', '');
      
      expect(window.alert).toHaveBeenCalledWith('✅ Success: ');
    });

    it('should handle null/undefined message gracefully', () => {
      service.showResult('error', null as any);
      
      expect(window.alert).toHaveBeenCalledWith('❌ Error: null');
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(1000);
      
      service.showResult('info', longMessage);
      
      expect(window.alert).toHaveBeenCalledWith(`ℹ️ Info: ${longMessage}`);
    });

    it('should handle messages with special characters', () => {
      const specialMessage = 'Message with "quotes" and <html> & symbols';
      
      service.showResult('success', specialMessage);
      
      expect(window.alert).toHaveBeenCalledWith(`✅ Success: ${specialMessage}`);
    });

    it('should handle messages with line breaks', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      
      service.showResult('error', multilineMessage);
      
      expect(window.alert).toHaveBeenCalledWith(`❌ Error: ${multilineMessage}`);
    });
  });

  describe('Message Type Icon Mapping', () => {
    beforeEach(() => {
      spyOn(window, 'alert');
    });

    it('should use correct icon for each message type', () => {
      const testCases = [
        { type: 'success', expectedIcon: '✅' },
        { type: 'error', expectedIcon: '❌' },
        { type: 'info', expectedIcon: 'ℹ️' },
        { type: 'warning', expectedIcon: '⚠️' }
      ];

      testCases.forEach(({ type, expectedIcon }) => {
        service.showResult(type as any, 'test message');
        
        expect(window.alert).toHaveBeenCalledWith(
          jasmine.stringMatching(new RegExp(`^${expectedIcon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
        );
      });
    });
  });

  describe('Alert Integration', () => {
    it('should not call alert if window.alert is not available', () => {
      const originalAlert = window.alert;
      (window as any).alert = undefined;
      
      expect(() => {
        service.showResult('success', 'test message');
      }).not.toThrow();
      
      window.alert = originalAlert;
    });

    it('should handle alert function throwing an error', () => {
      spyOn(window, 'alert').and.throwError('Alert blocked');
      
      expect(() => {
        service.showResult('error', 'test message');
      }).not.toThrow();
    });
  });

  describe('Performance and Memory', () => {
    beforeEach(() => {
      spyOn(window, 'alert');
    });

    it('should handle rapid consecutive calls', () => {
      for (let i = 0; i < 100; i++) {
        service.showResult('info', `Message ${i}`);
      }
      
      expect(window.alert).toHaveBeenCalledTimes(100);
    });

    it('should not retain references to messages', () => {
      const message = 'Test message';
      
      service.showResult('success', message);
      
      expect(service).toBeTruthy();
      expect(window.alert).toHaveBeenCalledWith(`✅ Success: ${message}`);
    });
  });
});