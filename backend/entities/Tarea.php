<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tarea extends Model {
    use SoftDeletes;

    protected $table = 'tareas';
    protected $fillable = ['titulo', 'descripcion', 'prioridad_id', 'estado_id', 'usuario_id'];
    
    public $timestamps = true;

    public function prioridad() {
        return $this->belongsTo(Prioridad::class, 'prioridad_id');
    }

    public function estado() {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function usuario() {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function movimientos() {
        return $this->hasMany(Movimiento::class, 'tarea_id')->orderBy('fecha_movimiento', 'desc');
    }
}
