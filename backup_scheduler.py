#!/usr/bin/env python3
"""
Script para programar respaldos automáticos del sistema DocTec
Uso: python backup_scheduler.py [daily|weekly|monthly]
"""

import sys
import os
import schedule
import time
import logging
from datetime import datetime
from backup_manager import BackupManager

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/backup_scheduler.log'),
        logging.StreamHandler()
    ]
)

def daily_backup():
    """Respaldo diario"""
    logging.info("🔄 Iniciando respaldo diario...")
    backup_manager = BackupManager()
    success = backup_manager.create_backup_with_metadata()
    
    if success:
        logging.info("✅ Respaldo diario completado exitosamente")
    else:
        logging.error("❌ Error en respaldo diario")

def weekly_backup():
    """Respaldo semanal con limpieza"""
    logging.info("🔄 Iniciando respaldo semanal...")
    backup_manager = BackupManager()
    success = backup_manager.create_backup_with_metadata()
    
    if success:
        # Limpiar respaldos antiguos (mantener solo 10)
        backup_manager.cleanup_old_backups()
        logging.info("✅ Respaldo semanal completado exitosamente")
    else:
        logging.error("❌ Error en respaldo semanal")

def monthly_backup():
    """Respaldo mensual completo"""
    logging.info("🔄 Iniciando respaldo mensual...")
    backup_manager = BackupManager()
    success = backup_manager.create_backup_with_metadata()
    
    if success:
        # Crear respaldo adicional con metadatos detallados
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        metadata_path = f"backups/monthly_backup_{timestamp}.json"
        
        metadata = {
            'backup_date': datetime.now().isoformat(),
            'backup_type': 'monthly',
            'description': 'Respaldo mensual completo del sistema DocTec',
            'version': '1.0',
            'month': datetime.now().strftime('%B %Y'),
            'backup_manager': 'DocTec Backup System'
        }
        
        try:
            import json
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            logging.info(f"📄 Metadatos mensuales guardados: {metadata_path}")
        except Exception as e:
            logging.error(f"Error al guardar metadatos mensuales: {e}")
        
        logging.info("✅ Respaldo mensual completado exitosamente")
    else:
        logging.error("❌ Error en respaldo mensual")

def setup_scheduler():
    """Configurar el programador de tareas"""
    logging.info("🚀 Configurando programador de respaldos...")
    
    # Respaldo diario a las 2:00 AM
    schedule.every().day.at("02:00").do(daily_backup)
    
    # Respaldo semanal los domingos a las 3:00 AM
    schedule.every().sunday.at("03:00").do(weekly_backup)
    
    # Respaldo mensual el primer día del mes a las 4:00 AM
    schedule.every().month.at("04:00").do(monthly_backup)
    
    logging.info("✅ Programador configurado:")
    logging.info("   📅 Diario: 02:00 AM")
    logging.info("   📅 Semanal: Domingo 03:00 AM")
    logging.info("   📅 Mensual: Primer día del mes 04:00 AM")

def run_scheduler():
    """Ejecutar el programador de tareas"""
    logging.info("🔄 Iniciando programador de respaldos...")
    
    while True:
        try:
            schedule.run_pending()
            time.sleep(60)  # Verificar cada minuto
        except KeyboardInterrupt:
            logging.info("⏹️ Programador detenido por el usuario")
            break
        except Exception as e:
            logging.error(f"Error en el programador: {e}")
            time.sleep(300)  # Esperar 5 minutos antes de reintentar

def manual_backup(backup_type="daily"):
    """Ejecutar respaldo manual"""
    logging.info(f"🔄 Ejecutando respaldo manual tipo: {backup_type}")
    
    if backup_type == "daily":
        daily_backup()
    elif backup_type == "weekly":
        weekly_backup()
    elif backup_type == "monthly":
        monthly_backup()
    else:
        logging.error(f"Tipo de respaldo no válido: {backup_type}")

def show_status():
    """Mostrar estado del sistema de respaldos"""
    backup_manager = BackupManager()
    backups = backup_manager.get_backup_info()
    
    print("📊 Estado del Sistema de Respaldo:")
    print(f"   📁 Total de respaldos: {len(backups)}")
    
    if backups:
        latest = backups[0]
        print(f"   📅 Último respaldo: {latest['date']}")
        print(f"   📏 Tamaño: {latest['size_mb']} MB")
        print(f"   📄 Archivo: {latest['filename']}")
    
    print("\n⏰ Próximos respaldos programados:")
    print("   📅 Diario: 02:00 AM")
    print("   📅 Semanal: Domingo 03:00 AM")
    print("   📅 Mensual: Primer día del mes 04:00 AM")

if __name__ == "__main__":
    # Crear directorios necesarios
    os.makedirs('backups', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "daily":
            manual_backup("daily")
        elif command == "weekly":
            manual_backup("weekly")
        elif command == "monthly":
            manual_backup("monthly")
        elif command == "status":
            show_status()
        elif command == "start":
            setup_scheduler()
            run_scheduler()
        else:
            print("Uso: python backup_scheduler.py [daily|weekly|monthly|status|start]")
            print("  daily   - Ejecutar respaldo diario")
            print("  weekly  - Ejecutar respaldo semanal")
            print("  monthly - Ejecutar respaldo mensual")
            print("  status  - Mostrar estado del sistema")
            print("  start   - Iniciar programador automático")
    else:
        print("🚀 Sistema de Respaldo DocTec")
        print("Uso: python backup_scheduler.py [daily|weekly|monthly|status|start]")
        print("\nEjemplos:")
        print("  python backup_scheduler.py daily    # Respaldo diario")
        print("  python backup_scheduler.py status   # Ver estado")
        print("  python backup_scheduler.py start    # Iniciar automático") 