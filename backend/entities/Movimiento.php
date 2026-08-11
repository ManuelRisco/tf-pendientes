<?php

use Illuminate\Database\Eloquent\Model;

class Movimiento extends Model {
    protected $table = 'movimientos';
    protected $fillable = ['tarea_id', 'usuario_id', 'estado_anterior_id', 'estado_nuevo_id', 'comentario', 'fecha_movimiento'];
    
    public $timestamps = false; 
    
    // Para mapear fecha_movimiento como un timestamp automáticamente si queremos
    // pero por ahora lo dejamos simple.

    public function tarea() {
        return $this->belongsTo(Tarea::class, 'tarea_id');
    }

    public function usuario() {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function estadoAnterior() {
        return $this->belongsTo(Estado::class, 'estado_anterior_id');
    }

    public function estadoNuevo() {
        return $this->belongsTo(Estado::class, 'estado_nuevo_id');
    }
}
