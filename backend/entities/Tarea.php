<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tarea extends Model {
    use SoftDeletes;

    protected $table = 'tareas';
    protected $fillable = [
        'titulo',
        'descripcion',
        'respuesta_admin',
        'prioridad_id',
        'estado_id',
        'usuario_id',
        'admin_id',
        'fecha_respuesta'
    ];
    
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

    public function admin() {
        return $this->belongsTo(Usuario::class, 'admin_id');
    }

    public function movimientos() {
        return $this->hasMany(Movimiento::class, 'tarea_id')->orderBy('fecha_movimiento', 'desc');
    }

    public function imagenes() {
        return $this->hasMany(TareaImagen::class, 'tarea_id')->orderBy('id', 'asc');
    }

    public function respuestas() {
        return $this->hasMany(TareaRespuesta::class, 'tarea_id')->orderBy('id', 'asc');
    }
}
